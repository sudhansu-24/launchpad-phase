import joblib
import numpy as np
import os

class NFTStakingPredictor:
    def __init__(self):
        """Initialize the predictor with the trained model and scaler"""
        model_dir = os.path.dirname(os.path.abspath(__file__))
        self.model = joblib.load(os.path.join(model_dir, 'nft_staking_model.joblib'))
        self.scaler = joblib.load(os.path.join(model_dir, 'scaler.joblib'))
    
    def predict_reward(self, rarity_score, staking_duration, market_volume):
        """
        Predict the reward for an NFT based on its characteristics
        
        Args:
            rarity_score (float): NFT rarity score (0.5-1.0)
            staking_duration (int): Duration of staking in days
            market_volume (float): Market volume of the NFT
            
        Returns:
            float: Predicted reward amount
        """
        # Prepare input data
        input_data = np.array([[rarity_score, staking_duration, market_volume]])
        
        # Scale the input
        input_scaled = self.scaler.transform(input_data)
        
        # Make prediction
        prediction = self.model.predict(input_scaled)[0]
        
        # Ensure prediction is non-negative
        return max(0, prediction)
    
    def get_feature_importance(self):
        """Get the importance of each feature in the model"""
        feature_names = ['rarity_score', 'staking_duration', 'market_volume']
        importance = self.model.feature_importances_
        return dict(zip(feature_names, importance))

def main():
    """Test the predictor with some example inputs"""
    predictor = NFTStakingPredictor()
    
    # Test cases
    test_cases = [
        (0.8, 30, 200),   # High rarity, short duration, medium volume
        (0.6, 90, 500),   # Medium rarity, medium duration, high volume
        (0.9, 180, 1000), # Very high rarity, long duration, very high volume
    ]
    
    print("Testing NFT Staking Reward Predictor:")
    print("-" * 50)
    
    for rarity, duration, volume in test_cases:
        reward = predictor.predict_reward(rarity, duration, volume)
        print(f"\nInput:")
        print(f"Rarity Score: {rarity}")
        print(f"Staking Duration: {duration} days")
        print(f"Market Volume: {volume}")
        print(f"Predicted Reward: {reward:.2f} tokens")
    
    print("\nFeature Importance:")
    importance = predictor.get_feature_importance()
    for feature, imp in importance.items():
        print(f"{feature}: {imp:.4f}")

if __name__ == "__main__":
    main() 