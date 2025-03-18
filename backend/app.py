from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import time
from model.predict_rewards import NFTStakingPredictor

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the AI predictor
try:
    predictor = NFTStakingPredictor()
    print("AI model loaded successfully!")
except Exception as e:
    print(f"Error loading AI model: {str(e)}")
    predictor = None

# Temporary in-memory storage for NFTs
nfts = {}
nft_counter = 1

# Staking and rewards data
staked_nfts = {}
reward_rates = {
    1: 10,  # Common: 10 tokens per day
    2: 25,  # Rare: 25 tokens per day
    3: 50,  # Epic: 50 tokens per day
    4: 100  # Legendary: 100 tokens per day
}

# Market volume tracking
market_volumes = {}

# Basic error handling
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.route('/')
def home():
    try:
        return jsonify({
            "status": "success",
            "message": "Space NFT Marketplace API",
            "version": "1.0.0"
        })
    except Exception as e:
        app.logger.error(f"Error in home route: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "services": {
            "database": "not_configured",
            "ai_model": "not_configured"
        }
    })

# NFT endpoints
@app.route('/api/nfts', methods=['GET'])
def get_nfts():
    return jsonify(list(nfts.values()))

@app.route('/api/nfts/<int:nft_id>', methods=['GET'])
def get_nft(nft_id):
    nft = nfts.get(nft_id)
    if nft is None:
        return jsonify({"error": "NFT not found"}), 404
    
    # Add staking info if the NFT is staked
    if nft_id in staked_nfts:
        nft['staking_info'] = staked_nfts[nft_id]
        nft['pending_rewards'] = calculate_rewards(nft_id)
    
    return jsonify(nft)

@app.route('/api/nfts', methods=['POST'])
def create_nft():
    global nft_counter
    data = request.get_json()
    
    required_fields = ['name', 'description', 'price', 'image_url', 'rarity']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    if not 1 <= data['rarity'] <= 4:
        return jsonify({"error": "Invalid rarity level (must be 1-4)"}), 400
    
    new_nft = {
        'id': nft_counter,
        'name': data['name'],
        'description': data['description'],
        'price': float(data['price']),
        'image_url': data['image_url'],
        'rarity': data['rarity'],
        'is_staked': False
    }
    
    nfts[nft_counter] = new_nft
    nft_counter += 1
    
    return jsonify(new_nft), 201

@app.route('/api/nfts/<int:nft_id>', methods=['PUT'])
def update_nft(nft_id):
    if nft_id not in nfts:
        return jsonify({"error": "NFT not found"}), 404
    
    data = request.get_json()
    nft = nfts[nft_id]
    
    # Prevent updating staked NFTs
    if nft.get('is_staked', False):
        return jsonify({"error": "Cannot update staked NFT"}), 400
    
    # Update only provided fields
    for field in ['name', 'description', 'price', 'image_url', 'rarity']:
        if field in data:
            if field == 'price':
                nft[field] = float(data[field])
            elif field == 'rarity' and not 1 <= data[field] <= 4:
                return jsonify({"error": "Invalid rarity level (must be 1-4)"}), 400
            else:
                nft[field] = data[field]
    
    return jsonify(nft)

@app.route('/api/nfts/<int:nft_id>', methods=['DELETE'])
def delete_nft(nft_id):
    if nft_id not in nfts:
        return jsonify({"error": "NFT not found"}), 404
    
    nft = nfts[nft_id]
    if nft.get('is_staked', False):
        return jsonify({"error": "Cannot delete staked NFT"}), 400
    
    deleted_nft = nfts.pop(nft_id)
    return jsonify(deleted_nft)

# Staking endpoints
@app.route('/api/nfts/<int:nft_id>/stake', methods=['POST'])
def stake_nft(nft_id):
    if nft_id not in nfts:
        return jsonify({"error": "NFT not found"}), 404
    
    nft = nfts[nft_id]
    if nft.get('is_staked', False):
        return jsonify({"error": "NFT already staked"}), 400
    
    current_time = int(time.time())
    staking_info = {
        'staking_start_time': current_time,
        'last_reward_claim': current_time
    }
    
    nft['is_staked'] = True
    staked_nfts[nft_id] = staking_info
    
    return jsonify({
        "message": "NFT staked successfully",
        "nft": nft,
        "staking_info": staking_info
    })

@app.route('/api/nfts/<int:nft_id>/unstake', methods=['POST'])
def unstake_nft(nft_id):
    if nft_id not in nfts:
        return jsonify({"error": "NFT not found"}), 404
    
    nft = nfts[nft_id]
    if not nft.get('is_staked', False):
        return jsonify({"error": "NFT not staked"}), 400
    
    # Calculate final rewards
    final_rewards = calculate_rewards(nft_id)
    
    nft['is_staked'] = False
    staking_info = staked_nfts.pop(nft_id)
    
    return jsonify({
        "message": "NFT unstaked successfully",
        "nft": nft,
        "final_rewards": final_rewards,
        "staking_info": staking_info
    })

@app.route('/api/nfts/<int:nft_id>/rewards', methods=['GET'])
def get_rewards(nft_id):
    if nft_id not in nfts:
        return jsonify({"error": "NFT not found"}), 404
    
    nft = nfts[nft_id]
    if not nft.get('is_staked', False):
        return jsonify({"error": "NFT not staked"}), 400
    
    rewards = calculate_rewards(nft_id)
    return jsonify({
        "nft_id": nft_id,
        "pending_rewards": rewards
    })

@app.route('/api/nfts/<int:nft_id>/claim-rewards', methods=['POST'])
def claim_rewards(nft_id):
    if nft_id not in nfts:
        return jsonify({"error": "NFT not found"}), 404
    
    nft = nfts[nft_id]
    if not nft.get('is_staked', False):
        return jsonify({"error": "NFT not staked"}), 400
    
    rewards = calculate_rewards(nft_id)
    if rewards <= 0:
        return jsonify({"error": "No rewards to claim"}), 400
    
    # Update last claim time
    staked_nfts[nft_id]['last_reward_claim'] = int(time.time())
    
    return jsonify({
        "message": "Rewards claimed successfully",
        "claimed_amount": rewards,
        "nft": nft
    })

def calculate_rewards(nft_id):
    if nft_id not in staked_nfts:
        return 0
    
    nft = nfts[nft_id]
    staking_info = staked_nfts[nft_id]
    
    current_time = int(time.time())
    time_staked = current_time - staking_info['last_reward_claim']
    
    # Convert rarity to score (1-4 -> 0.5-1.0)
    rarity_score = 0.5 + (nft['rarity'] - 1) * 0.5
    
    # Get staking duration in days
    staking_duration = time_staked // 86400
    
    # Get market volume (default to 100 if not tracked)
    market_volume = market_volumes.get(nft_id, 100)
    
    if predictor is not None:
        # Use AI model for prediction
        predicted_reward = predictor.predict_reward(rarity_score, staking_duration, market_volume)
        return int(predicted_reward)
    else:
        # Fallback to original calculation
        reward_rate = reward_rates[nft['rarity']]
        return (time_staked * reward_rate) // 86400

@app.route('/api/nfts/<int:nft_id>/market-volume', methods=['POST'])
def update_market_volume(nft_id):
    """Update the market volume for an NFT"""
    if nft_id not in nfts:
        return jsonify({"error": "NFT not found"}), 404
    
    data = request.get_json()
    if 'volume' not in data:
        return jsonify({"error": "Volume not provided"}), 400
    
    market_volumes[nft_id] = float(data['volume'])
    return jsonify({
        "message": "Market volume updated successfully",
        "nft_id": nft_id,
        "volume": market_volumes[nft_id]
    })

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    app.logger.info(f"Starting Flask app on port {port} with debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug) 