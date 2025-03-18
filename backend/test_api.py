import requests
import json
import time

BASE_URL = 'http://127.0.0.1:5000'

def test_get_nfts():
    print("\nTesting GET /api/nfts")
    response = requests.get(f'{BASE_URL}/api/nfts')
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

def test_get_nft_by_id():
    print("\nTesting GET /api/nfts/1")
    response = requests.get(f'{BASE_URL}/api/nfts/1')
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

def test_create_nft():
    print("\nTesting POST /api/nfts")
    new_nft = {
        "name": "Test NFT",
        "description": "This is a test NFT",
        "price": 100.0,
        "image_url": "https://example.com/test.jpg",
        "rarity": 1  # Common rarity
    }
    response = requests.post(f'{BASE_URL}/api/nfts', json=new_nft)
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))
    return response.json()['id']

def test_update_nft(nft_id):
    print("\nTesting PUT /api/nfts/{nft_id}")
    update_data = {
        "price": 150.0,
        "rarity": 2  # Upgrade to Rare
    }
    response = requests.put(f'{BASE_URL}/api/nfts/{nft_id}', json=update_data)
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

def test_stake_nft(nft_id):
    print("\nTesting POST /api/nfts/{nft_id}/stake")
    response = requests.post(f'{BASE_URL}/api/nfts/{nft_id}/stake')
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

def test_get_rewards(nft_id):
    print("\nTesting GET /api/nfts/{nft_id}/rewards")
    # Wait for 5 seconds to accumulate some rewards
    print("Waiting 5 seconds to accumulate rewards...")
    time.sleep(5)
    
    response = requests.get(f'{BASE_URL}/api/nfts/{nft_id}/rewards')
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

def test_claim_rewards(nft_id):
    print("\nTesting POST /api/nfts/{nft_id}/claim-rewards")
    response = requests.post(f'{BASE_URL}/api/nfts/{nft_id}/claim-rewards')
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

def test_unstake_nft(nft_id):
    print("\nTesting POST /api/nfts/{nft_id}/unstake")
    response = requests.post(f'{BASE_URL}/api/nfts/{nft_id}/unstake')
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

def test_delete_nft(nft_id):
    print("\nTesting DELETE /api/nfts/{nft_id}")
    response = requests.delete(f'{BASE_URL}/api/nfts/{nft_id}')
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    print("Starting API tests...")
    
    # Test basic NFT operations
    test_get_nfts()
    nft_id = test_create_nft()
    test_get_nft_by_id()
    test_update_nft(nft_id)
    
    # Test staking and rewards
    test_stake_nft(nft_id)
    test_get_rewards(nft_id)
    test_claim_rewards(nft_id)
    test_unstake_nft(nft_id)
    
    # Clean up
    test_delete_nft(nft_id)
    
    print("\nAPI tests completed!") 