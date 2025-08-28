"""
User Management System for SecureBank AI Chatbot
Handles user authentication, profiles, and session management
"""

import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
from dataclasses import dataclass, asdict
import re
from enum import Enum

class UserRole(Enum):
    """User roles enumeration"""
    ADMIN = "admin"
    USER = "user"
    SUPPORT = "support"

class UserStatus(Enum):
    """User status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

@dataclass
class User:
    """User data model"""
    id: str
    email: str
    name: str
    password_hash: str
    role: UserRole
    status: UserStatus
    phone: Optional[str] = None
    account_number: Optional[str] = None
    created_at: str = None
    last_login: str = None
    login_attempts: int = 0
    profile_image: Optional[str] = None
    preferences: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.preferences is None:
            self.preferences = {
                "theme": "light",
                "notifications": True,
                "language": "en",
                "currency": "INR"
            }

    def to_dict(self) -> Dict:
        """Convert user to dictionary (excluding password)"""
        user_dict = asdict(self)
        user_dict.pop('password_hash', None)
        user_dict['role'] = self.role.value
        user_dict['status'] = self.status.value
        return user_dict

    def is_active(self) -> bool:
        """Check if user is active"""
        return self.status == UserStatus.ACTIVE

    def is_admin(self) -> bool:
        """Check if user is admin"""
        return self.role == UserRole.ADMIN

class SessionManager:
    """Session management for users"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.active_sessions: Dict[str, Dict] = {}
        self.session_timeout = timedelta(hours=24)

    def create_session(self, user: User) -> Dict[str, str]:
        """Create a new session for user"""
        session_id = secrets.token_urlsafe(32)
        
        # Create JWT token
        payload = {
            'user_id': user.id,
            'email': user.email,
            'role': user.role.value,
            'session_id': session_id,
            'exp': datetime.utcnow() + self.session_timeout,
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        
        # Store session
        self.active_sessions[session_id] = {
            'user_id': user.id,
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat(),
            'user_agent': None,
            'ip_address': None
        }
        
        return {
            'session_id': session_id,
            'token': token,
            'expires_at': (datetime.utcnow() + self.session_timeout).isoformat()
        }

    def validate_session(self, token: str) -> Optional[Dict]:
        """Validate session token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            session_id = payload.get('session_id')
            
            if session_id in self.active_sessions:
                # Update last activity
                self.active_sessions[session_id]['last_activity'] = datetime.utcnow().isoformat()
                return payload
            
        except jwt.ExpiredSignatureError:
            print("Token has expired")
        except jwt.InvalidTokenError:
            print("Invalid token")
        
        return None

    def revoke_session(self, session_id: str) -> bool:
        """Revoke a session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            return True
        return False

    def get_user_sessions(self, user_id: str) -> List[Dict]:
        """Get all active sessions for a user"""
        return [
            {**session_data, 'session_id': session_id}
            for session_id, session_data in self.active_sessions.items()
            if session_data['user_id'] == user_id
        ]

class UserManager:
    """Main user management service"""
    
    def __init__(self, secret_key: str = "securebank_secret_key_2024"):
        self.secret_key = secret_key
        self.users: Dict[str, User] = {}
        self.email_to_user_id: Dict[str, str] = {}
        self.account_to_user_id: Dict[str, str] = {}
        self.session_manager = SessionManager(secret_key)
        
        # Initialize with default users
        self._initialize_default_users()

    def _initialize_default_users(self):
        """Initialize with default admin and sample users"""
        default_users = [
            {
                "id": "admin_001",
                "email": "admin@securebank.com",
                "name": "Admin User",
                "password": "admin123",
                "role": UserRole.ADMIN,
                "status": UserStatus.ACTIVE,
                "account_number": None
            },
            {
                "id": "user_001",
                "email": "rajesh@securebank.com",
                "name": "Rajesh Kumar",
                "password": "user123",
                "role": UserRole.USER,
                "status": UserStatus.ACTIVE,
                "account_number": "1234567890",
                "phone": "9876543210"
            },
            {
                "id": "user_002",
                "email": "priya@securebank.com",
                "name": "Priya Sharma",
                "password": "user123",
                "role": UserRole.USER,
                "status": UserStatus.ACTIVE,
                "account_number": "2345678901",
                "phone": "8765432109"
            },
            {
                "id": "user_003",
                "email": "amit@securebank.com",
                "name": "Amit Singh",
                "password": "user123",
                "role": UserRole.USER,
                "status": UserStatus.ACTIVE,
                "account_number": "3456789012",
                "phone": "7654321098"
            }
        ]
        
        for user_data in default_users:
            self.create_user(
                email=user_data["email"],
                name=user_data["name"],
                password=user_data["password"],
                role=user_data["role"],
                account_number=user_data.get("account_number"),
                phone=user_data.get("phone"),
                user_id=user_data["id"]
            )
        
        print(f"✅ Initialized {len(default_users)} default users")

    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}:{password_hash}"

    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            salt, hash_value = password_hash.split(':')
            return hashlib.sha256((password + salt).encode()).hexdigest() == hash_value
        except ValueError:
            return False

    def _validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def _validate_password(self, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        requirements = {
            "length": len(password) >= 6,
            "has_upper": any(c.isupper() for c in password),
            "has_lower": any(c.islower() for c in password),
            "has_digit": any(c.isdigit() for c in password)
        }
        
        is_valid = all(requirements.values())
        
        return {
            "valid": is_valid,
            "requirements": requirements,
            "message": "Password is strong" if is_valid else "Password does not meet requirements"
        }

    def create_user(self, email: str, name: str, password: str, 
                   role: UserRole = UserRole.USER, 
                   phone: str = None, 
                   account_number: str = None,
                   user_id: str = None) -> Dict[str, Any]:
        """Create a new user"""
        
        # Validate email
        if not self._validate_email(email):
            return {"success": False, "message": "Invalid email format"}
        
        # Check if email already exists
        if email.lower() in self.email_to_user_id:
            return {"success": False, "message": "Email already exists"}
        
        # Check if account number already exists
        if account_number and account_number in self.account_to_user_id:
            return {"success": False, "message": "Account number already exists"}
        
        # Validate password
        password_validation = self._validate_password(password)
        if not password_validation["valid"]:
            return {"success": False, "message": password_validation["message"]}
        
        # Generate user ID if not provided
        if not user_id:
            user_id = f"user_{len(self.users) + 1:03d}"
        
        # Create user
        user = User(
            id=user_id,
            email=email.lower(),
            name=name,
            password_hash=self._hash_password(password),
            role=role,
            status=UserStatus.ACTIVE,
            phone=phone,
            account_number=account_number
        )
        
        # Store user
        self.users[user_id] = user
        self.email_to_user_id[email.lower()] = user_id
        
        if account_number:
            self.account_to_user_id[account_number] = user_id
        
        print(f"✅ Created user: {name} ({email}) - {role.value}")
        
        return {
            "success": True,
            "message": "User created successfully",
            "user": user.to_dict()
        }

    def authenticate_user(self, email: str = None, password: str = None,
                         account_number: str = None, pin: str = None) -> Dict[str, Any]:
        """Authenticate user with email/password or account/pin"""
        
        user = None
        
        # Email/password authentication
        if email and password:
            email = email.lower()
            if email not in self.email_to_user_id:
                return {"success": False, "message": "Invalid credentials"}
            
            user_id = self.email_to_user_id[email]
            user = self.users[user_id]
            
            if not self._verify_password(password, user.password_hash):
                # Increment login attempts
                user.login_attempts += 1
                if user.login_attempts >= 5:
                    user.status = UserStatus.SUSPENDED
                    return {"success": False, "message": "Account suspended due to multiple failed attempts"}
                return {"success": False, "message": "Invalid credentials"}
        
        # Account number/PIN authentication
        elif account_number and pin:
            if account_number not in self.account_to_user_id:
                return {"success": False, "message": "Invalid account credentials"}
            
            user_id = self.account_to_user_id[account_number]
            user = self.users[user_id]
            
            # For demo purposes, PIN validation is simplified
            # In production, PIN should be properly hashed and stored
            valid_pins = {
                "1234567890": "1234",
                "2345678901": "5678",
                "3456789012": "9012"
            }
            
            if account_number not in valid_pins or valid_pins[account_number] != pin:
                return {"success": False, "message": "Invalid account credentials"}
        
        else:
            return {"success": False, "message": "Invalid authentication method"}
        
        # Check if user is active
        if not user.is_active():
            return {"success": False, "message": f"Account is {user.status.value}"}
        
        # Reset login attempts on successful login
        user.login_attempts = 0
        user.last_login = datetime.utcnow().isoformat()
        
        # Create session
        session_data = self.session_manager.create_session(user)
        
        return {
            "success": True,
            "message": "Authentication successful",
            "user": user.to_dict(),
            "session": session_data
        }

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.users.get(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        user_id = self.email_to_user_id.get(email.lower())
        return self.users.get(user_id) if user_id else None

    def get_user_by_account(self, account_number: str) -> Optional[User]:
        """Get user by account number"""
        user_id = self.account_to_user_id.get(account_number)
        return self.users.get(user_id) if user_id else None

    def update_user_profile(self, user_id: str, **kwargs) -> Dict[str, Any]:
        """Update user profile"""
        user = self.get_user_by_id(user_id)
        if not user:
            return {"success": False, "message": "User not found"}
        
        # Update allowed fields
        allowed_fields = ['name', 'phone', 'preferences', 'profile_image']
        
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(user, field, value)
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": user.to_dict()
        }

    def change_password(self, user_id: str, current_password: str, new_password: str) -> Dict[str, Any]:
        """Change user password"""
        user = self.get_user_by_id(user_id)
        if not user:
            return {"success": False, "message": "User not found"}
        
        # Verify current password
        if not self._verify_password(current_password, user.password_hash):
            return {"success": False, "message": "Current password is incorrect"}
        
        # Validate new password
        password_validation = self._validate_password(new_password)
        if not password_validation["valid"]:
            return {"success": False, "message": password_validation["message"]}
        
        # Update password
        user.password_hash = self._hash_password(new_password)
        
        return {"success": True, "message": "Password changed successfully"}

    def deactivate_user(self, user_id: str) -> Dict[str, Any]:
        """Deactivate user account"""
        user = self.get_user_by_id(user_id)
        if not user:
            return {"success": False, "message": "User not found"}
        
        user.status = UserStatus.INACTIVE
        
        # Revoke all sessions
        sessions = self.session_manager.get_user_sessions(user_id)
        for session in sessions:
            self.session_manager.revoke_session(session['session_id'])
        
        return {"success": True, "message": "User deactivated successfully"}

    def get_all_users(self) -> List[Dict]:
        """Get all users (admin only)"""
        return [user.to_dict() for user in self.users.values()]

    def get_user_statistics(self) -> Dict[str, Any]:
        """Get user statistics"""
        total_users = len(self.users)
        active_users = len([u for u in self.users.values() if u.status == UserStatus.ACTIVE])
        admin_users = len([u for u in self.users.values() if u.role == UserRole.ADMIN])
        
        role_distribution = {}
        status_distribution = {}
        
        for user in self.users.values():
            role_distribution[user.role.value] = role_distribution.get(user.role.value, 0) + 1
            status_distribution[user.status.value] = status_distribution.get(user.status.value, 0) + 1
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "admin_users": admin_users,
            "role_distribution": role_distribution,
            "status_distribution": status_distribution,
            "active_sessions": len(self.session_manager.active_sessions)
        }

    def validate_session_token(self, token: str) -> Optional[Dict]:
        """Validate session token"""
        return self.session_manager.validate_session(token)

    def logout_user(self, session_id: str) -> Dict[str, Any]:
        """Logout user by revoking session"""
        success = self.session_manager.revoke_session(session_id)
        return {
            "success": success,
            "message": "Logged out successfully" if success else "Session not found"
        }

# Global user manager instance
user_manager = UserManager()

def get_user_manager() -> UserManager:
    """Get the global user manager instance"""
    return user_manager

# Utility functions
def authenticate_request(token: str) -> Optional[Dict]:
    """Authenticate API request with token"""
    return user_manager.validate_session_token(token)

def get_current_user(token: str) -> Optional[User]:
    """Get current user from token"""
    session_data = authenticate_request(token)
    if session_data:
        return user_manager.get_user_by_id(session_data['user_id'])
    return None

def require_admin(token: str) -> bool:
    """Check if token belongs to admin user"""
    user = get_current_user(token)
    return user and user.is_admin()

if __name__ == "__main__":
    # Test the user management system
    print("👥 User Management System Test")
    
    manager = get_user_manager()
    
    # Test authentication
    print("\n🔐 Testing Authentication:")
    
    # Email/password authentication
    auth_result = manager.authenticate_user(
        email="rajesh@securebank.com",
        password="user123"
    )
    
    if auth_result["success"]:
        print(f"✅ Email Auth: {auth_result['user']['name']}")
        token = auth_result['session']['token']
        
        # Test token validation
        session_data = manager.validate_session_token(token)
        if session_data:
            print(f"✅ Token Valid: User {session_data['user_id']}")
    
    # Account/PIN authentication
    auth_result2 = manager.authenticate_user(
        account_number="1234567890",
        pin="1234"
    )
    
    if auth_result2["success"]:
        print(f"✅ Account Auth: {auth_result2['user']['name']}")
    
    # Test user statistics
    print(f"\n📊 User Statistics:")
    stats = manager.get_user_statistics()
    print(f"  Total Users: {stats['total_users']}")
    print(f"  Active Users: {stats['active_users']}")
    print(f"  Admin Users: {stats['admin_users']}")
    print(f"  Active Sessions: {stats['active_sessions']}")
