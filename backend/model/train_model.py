import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

def generate_synthetic_data(n_samples=1000):
    """Generate synthetic data for training the model"""
    np.random.seed(42)
    
    # Generate random data
    rarity_scores = np.random.uniform(0.5, 1.0, n_samples)  # Rarity scores between 0.5 and 1.0
    staking_durations = np.random.randint(1, 365, n_samples)  # Staking durations in days
    market_volumes = np.random.uniform(50, 1000, n_samples)  # Market volumes
    
    # Calculate rewards based on our existing formula with some randomness
    base_rewards = (staking_durations * rarity_scores * 10)  # Base reward calculation
    volume_bonus = (market_volumes / 100) * 5  # Volume bonus
    rewards = base_rewards + volume_bonus + np.random.normal(0, 5, n_samples)  # Add some noise
    
    # Ensure rewards are positive
    rewards = np.maximum(rewards, 0)
    
    return pd.DataFrame({
        'rarity_score': rarity_scores,
        'staking_duration': staking_durations,
        'market_volume': market_volumes,
        'reward': rewards
    })

def train_model():
    """Train the NFT staking reward prediction model"""
    print("Generating synthetic training data...")
    df = generate_synthetic_data()
    
    # Prepare features and target
    X = df[['rarity_score', 'staking_duration', 'market_volume']]
    y = df['reward']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train the model
    print("Training Random Forest model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate the model
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"\nModel Performance:")
    print(f"Training R² Score: {train_score:.4f}")
    print(f"Testing R² Score: {test_score:.4f}")
    
    # Save the model and scaler
    model_dir = os.path.dirname(os.path.abspath(__file__))
    joblib.dump(model, os.path.join(model_dir, 'nft_staking_model.joblib'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.joblib'))
    
    print("\nModel and scaler saved successfully!")
    
    # Print feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    print(feature_importance)

if __name__ == "__main__":
    train_model() 