"""
Banking Data Models and Services
Contains customer accounts, transactions, and banking operations
"""

from datetime import datetime, timedelta
import random
from typing import Dict, List, Optional, Any
import json

class BankAccount:
    """Bank account model with comprehensive banking data"""
    
    def __init__(self, account_number: str, customer_name: str, account_type: str = "Savings"):
        self.account_number = account_number
        self.customer_name = customer_name
        self.account_type = account_type  # Savings, Current, Fixed Deposit
        self.balance = random.randint(10000, 500000)
        self.created_date = datetime.now() - timedelta(days=random.randint(30, 1825))
        self.status = "Active"
        self.phone = f"{random.randint(6000000000, 9999999999)}"
        self.email = customer_name.lower().replace(" ", "") + "@example.com"
        self.branch_code = "SB001"
        self.ifsc_code = "SBIN0000123"
        self.transactions = []
        self.cards = []
        self.loans = []
        
        # Generate sample transactions
        self._generate_sample_transactions()
        
        # Generate sample cards
        self._generate_sample_cards()

    def _generate_sample_transactions(self):
        """Generate sample transaction history"""
        transaction_types = [
            {"type": "credit", "description": "Salary Credit", "amount_range": (25000, 75000)},
            {"type": "debit", "description": "ATM Withdrawal", "amount_range": (1000, 10000)},
            {"type": "debit", "description": "Online Purchase", "amount_range": (500, 15000)},
            {"type": "debit", "description": "Utility Bill Payment", "amount_range": (500, 5000)},
            {"type": "credit", "description": "Interest Credit", "amount_range": (100, 2000)},
            {"type": "debit", "description": "Fund Transfer", "amount_range": (1000, 50000)},
            {"type": "credit", "description": "Refund Credit", "amount_range": (200, 5000)},
        ]
        
        # Generate 20-30 transactions over last 6 months
        num_transactions = random.randint(20, 30)
        
        for i in range(num_transactions):
            transaction_type = random.choice(transaction_types)
            amount = random.randint(*transaction_type["amount_range"])
            
            # Random date in last 6 months
            days_ago = random.randint(1, 180)
            transaction_date = datetime.now() - timedelta(days=days_ago)
            
            transaction = {
                "transaction_id": f"TXN{random.randint(1000000000, 9999999999)}",
                "date": transaction_date.isoformat(),
                "type": transaction_type["type"],
                "description": transaction_type["description"],
                "amount": amount,
                "balance_after": self.balance,  # Simplified balance calculation
                "reference": f"REF{random.randint(100000, 999999)}"
            }
            
            self.transactions.append(transaction)
        
        # Sort transactions by date (newest first)
        self.transactions.sort(key=lambda x: x["date"], reverse=True)

    def _generate_sample_cards(self):
        """Generate sample card information"""
        card_types = ["Debit Card", "Credit Card"]
        
        for card_type in card_types:
            if card_type == "Credit Card" and random.random() < 0.3:
                continue  # Not all accounts have credit cards
            
            card_number = f"****-****-****-{random.randint(1000, 9999)}"
            
            card = {
                "card_type": card_type,
                "card_number": card_number,
                "card_status": "Active",
                "expiry_date": (datetime.now() + timedelta(days=random.randint(365, 1825))).strftime("%m/%y"),
                "daily_limit": 50000 if card_type == "Debit Card" else random.randint(100000, 500000),
                "monthly_limit": 500000 if card_type == "Debit Card" else random.randint(1000000, 5000000),
                "issued_date": (datetime.now() - timedelta(days=random.randint(30, 1095))).isoformat()
            }
            
            self.cards.append(card)

    def get_recent_transactions(self, limit: int = 10) -> List[Dict]:
        """Get recent transactions"""
        return self.transactions[:limit]

    def get_account_summary(self) -> Dict:
        """Get comprehensive account summary"""
        return {
            "account_number": self.account_number,
            "customer_name": self.customer_name,
            "account_type": self.account_type,
            "balance": self.balance,
            "status": self.status,
            "created_date": self.created_date.isoformat(),
            "branch_code": self.branch_code,
            "ifsc_code": self.ifsc_code,
            "phone": self.phone,
            "email": self.email,
            "total_transactions": len(self.transactions),
            "active_cards": len([card for card in self.cards if card["card_status"] == "Active"]),
            "active_loans": len([loan for loan in self.loans if loan.get("status") == "Active"])
        }

    def add_transaction(self, transaction_type: str, amount: float, description: str) -> Dict:
        """Add a new transaction"""
        transaction = {
            "transaction_id": f"TXN{random.randint(1000000000, 9999999999)}",
            "date": datetime.now().isoformat(),
            "type": transaction_type,
            "description": description,
            "amount": amount,
            "balance_after": self.balance,
            "reference": f"REF{random.randint(100000, 999999)}"
        }
        
        self.transactions.insert(0, transaction)  # Add to beginning (most recent)
        return transaction

class LoanProduct:
    """Loan product information and eligibility"""
    
    def __init__(self):
        self.loan_products = {
            "personal_loan": {
                "name": "Personal Loan",
                "min_amount": 50000,
                "max_amount": 1000000,
                "interest_rate": 10.5,
                "tenure_months": [12, 24, 36, 48, 60],
                "eligibility": {
                    "min_income": 25000,
                    "min_credit_score": 650,
                    "min_account_age_months": 6
                },
                "required_documents": [
                    "Identity Proof", "Address Proof", "Income Proof",
                    "Bank Statements (6 months)", "Employment Certificate"
                ]
            },
            "home_loan": {
                "name": "Home Loan",
                "min_amount": 500000,
                "max_amount": 10000000,
                "interest_rate": 8.5,
                "tenure_months": [120, 180, 240, 300, 360],
                "eligibility": {
                    "min_income": 40000,
                    "min_credit_score": 700,
                    "min_account_age_months": 12
                },
                "required_documents": [
                    "Identity Proof", "Address Proof", "Income Proof",
                    "Property Documents", "Bank Statements (12 months)",
                    "Employment Certificate", "Property Valuation Report"
                ]
            },
            "car_loan": {
                "name": "Car Loan",
                "min_amount": 100000,
                "max_amount": 2000000,
                "interest_rate": 9.5,
                "tenure_months": [12, 24, 36, 48, 60, 72],
                "eligibility": {
                    "min_income": 30000,
                    "min_credit_score": 650,
                    "min_account_age_months": 6
                },
                "required_documents": [
                    "Identity Proof", "Address Proof", "Income Proof",
                    "Vehicle Quotation", "Bank Statements (6 months)",
                    "Employment Certificate"
                ]
            },
            "business_loan": {
                "name": "Business Loan",
                "min_amount": 200000,
                "max_amount": 5000000,
                "interest_rate": 11.0,
                "tenure_months": [12, 24, 36, 48, 60],
                "eligibility": {
                    "min_income": 50000,
                    "min_credit_score": 700,
                    "min_business_age_months": 24
                },
                "required_documents": [
                    "Business Registration", "GST Certificate", "ITR (3 years)",
                    "Bank Statements (12 months)", "Financial Statements",
                    "Identity and Address Proof"
                ]
            }
        }

    def get_loan_products(self) -> Dict:
        """Get all available loan products"""
        return self.loan_products

    def calculate_emi(self, principal: float, rate: float, tenure_months: int) -> Dict:
        """Calculate EMI for loan"""
        monthly_rate = rate / (12 * 100)
        emi = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months) / (((1 + monthly_rate) ** tenure_months) - 1)
        
        total_payment = emi * tenure_months
        total_interest = total_payment - principal
        
        return {
            "principal": principal,
            "interest_rate": rate,
            "tenure_months": tenure_months,
            "emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2)
        }

    def check_eligibility(self, loan_type: str, customer_income: float, credit_score: int, account_age_months: int) -> Dict:
        """Check loan eligibility"""
        if loan_type not in self.loan_products:
            return {"eligible": False, "reason": "Invalid loan type"}
        
        product = self.loan_products[loan_type]
        eligibility = product["eligibility"]
        
        checks = {
            "income_check": customer_income >= eligibility["min_income"],
            "credit_score_check": credit_score >= eligibility["min_credit_score"],
            "account_age_check": account_age_months >= eligibility["min_account_age_months"]
        }
        
        eligible = all(checks.values())
        
        if not eligible:
            reasons = []
            if not checks["income_check"]:
                reasons.append(f"Minimum income required: ₹{eligibility['min_income']:,}")
            if not checks["credit_score_check"]:
                reasons.append(f"Minimum credit score required: {eligibility['min_credit_score']}")
            if not checks["account_age_check"]:
                reasons.append(f"Account should be at least {eligibility['min_account_age_months']} months old")
        
        return {
            "eligible": eligible,
            "loan_type": loan_type,
            "loan_name": product["name"],
            "checks": checks,
            "reasons": reasons if not eligible else [],
            "max_eligible_amount": min(customer_income * 60, product["max_amount"]) if eligible else 0  # 60x income rule
        }

class BankingDataService:
    """Main banking data service"""
    
    def __init__(self):
        self.accounts: Dict[str, BankAccount] = {}
        self.loan_service = LoanProduct()
        
        # Initialize sample accounts
        self._initialize_sample_accounts()

    def _initialize_sample_accounts(self):
        """Initialize with sample banking data"""
        sample_customers = [
            {"name": "Rajesh Kumar", "account": "1234567890", "type": "Savings"},
            {"name": "Priya Sharma", "account": "2345678901", "type": "Current"},
            {"name": "Amit Singh", "account": "3456789012", "type": "Savings"},
            {"name": "Sneha Patel", "account": "4567890123", "type": "Savings"},
            {"name": "Vikram Gupta", "account": "5678901234", "type": "Current"},
            {"name": "Anita Reddy", "account": "6789012345", "type": "Savings"},
            {"name": "Ravi Krishnan", "account": "7890123456", "type": "Current"},
            {"name": "Meera Joshi", "account": "8901234567", "type": "Savings"},
        ]
        
        for customer in sample_customers:
            account = BankAccount(
                customer["account"],
                customer["name"],
                customer["type"]
            )
            self.accounts[customer["account"]] = account
            
            print(f"✅ Created account: {customer['name']} - {customer['account']} ({customer['type']})")

    def get_account(self, account_number: str) -> Optional[BankAccount]:
        """Get account by account number"""
        return self.accounts.get(account_number)

    def get_account_by_customer_name(self, customer_name: str) -> Optional[BankAccount]:
        """Get account by customer name"""
        for account in self.accounts.values():
            if account.customer_name.lower() == customer_name.lower():
                return account
        return None

    def transfer_money(self, from_account: str, to_account: str, amount: float, description: str = "") -> Dict:
        """Transfer money between accounts"""
        from_acc = self.get_account(from_account)
        to_acc = self.get_account(to_account)
        
        if not from_acc:
            return {"success": False, "message": "Source account not found"}
        
        if not to_acc:
            return {"success": False, "message": "Destination account not found"}
        
        if from_acc.balance < amount:
            return {"success": False, "message": "Insufficient balance"}
        
        if amount <= 0:
            return {"success": False, "message": "Invalid amount"}
        
        # Process transfer
        from_acc.balance -= amount
        to_acc.balance += amount
        
        # Add transactions
        debit_txn = from_acc.add_transaction(
            "debit",
            amount,
            f"Transfer to {to_acc.customer_name} - {description}".strip()
        )
        
        credit_txn = to_acc.add_transaction(
            "credit",
            amount,
            f"Transfer from {from_acc.customer_name} - {description}".strip()
        )
        
        return {
            "success": True,
            "message": "Transfer completed successfully",
            "transaction_id": debit_txn["transaction_id"],
            "from_account": from_account,
            "to_account": to_account,
            "amount": amount,
            "new_balance": from_acc.balance,
            "timestamp": datetime.now().isoformat()
        }

    def get_all_accounts_summary(self) -> List[Dict]:
        """Get summary of all accounts (for admin)"""
        return [account.get_account_summary() for account in self.accounts.values()]

    def search_accounts(self, query: str) -> List[Dict]:
        """Search accounts by name or account number"""
        query = query.lower()
        results = []
        
        for account in self.accounts.values():
            if (query in account.customer_name.lower() or 
                query in account.account_number or
                query in account.email.lower()):
                results.append(account.get_account_summary())
        
        return results

    def get_banking_statistics(self) -> Dict:
        """Get banking statistics for admin dashboard"""
        total_accounts = len(self.accounts)
        total_balance = sum(acc.balance for acc in self.accounts.values())
        total_transactions = sum(len(acc.transactions) for acc in self.accounts.values())
        
        account_types = {}
        for account in self.accounts.values():
            account_types[account.account_type] = account_types.get(account.account_type, 0) + 1
        
        return {
            "total_accounts": total_accounts,
            "total_balance": total_balance,
            "average_balance": total_balance / total_accounts if total_accounts > 0 else 0,
            "total_transactions": total_transactions,
            "account_types": account_types,
            "active_accounts": len([acc for acc in self.accounts.values() if acc.status == "Active"]),
            "total_cards": sum(len(acc.cards) for acc in self.accounts.values())
        }

# Global banking service instance
banking_service = BankingDataService()

def get_banking_service() -> BankingDataService:
    """Get the global banking service instance"""
    return banking_service

# Utility functions for easy access
def get_account_balance(account_number: str) -> Optional[float]:
    """Quick utility to get account balance"""
    account = banking_service.get_account(account_number)
    return account.balance if account else None

def get_customer_name(account_number: str) -> Optional[str]:
    """Quick utility to get customer name"""
    account = banking_service.get_account(account_number)
    return account.customer_name if account else None

def format_currency(amount: float) -> str:
    """Format amount as Indian currency"""
    return f"₹{amount:,.2f}"

def format_account_number(account_number: str) -> str:
    """Format account number for display"""
    if len(account_number) >= 4:
        return f"****{account_number[-4:]}"
    return account_number

if __name__ == "__main__":
    # Test the banking data service
    print("🏦 Banking Data Service Test")
    
    service = get_banking_service()
    
    # Test account retrieval
    test_account = "1234567890"
    account = service.get_account(test_account)
    
    if account:
        print(f"\n✅ Account Found: {account.customer_name}")
        print(f"💰 Balance: {format_currency(account.balance)}")
        print(f"📊 Transactions: {len(account.transactions)}")
        print(f"💳 Cards: {len(account.cards)}")
        
        # Show recent transactions
        print("\n📋 Recent Transactions:")
        for txn in account.get_recent_transactions(5):
            print(f"  {txn['date'][:10]} | {txn['type'].upper()} | {format_currency(txn['amount'])} | {txn['description']}")
    
    # Test loan eligibility
    print(f"\n🏠 Loan Eligibility Check:")
    eligibility = service.loan_service.check_eligibility("home_loan", 50000, 720, 18)
    print(f"  Eligible: {eligibility['eligible']}")
    if eligibility['eligible']:
        print(f"  Max Amount: {format_currency(eligibility['max_eligible_amount'])}")
    
    # Test statistics
    print(f"\n📊 Banking Statistics:")
    stats = service.get_banking_statistics()
    print(f"  Total Accounts: {stats['total_accounts']}")
    print(f"  Total Balance: {format_currency(stats['total_balance'])}")
    print(f"  Average Balance: {format_currency(stats['average_balance'])}")