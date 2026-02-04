#!/usr/bin/env python3
"""
Comprehensive InsightX Website Test
Tests all major functionality and provides recommendations
"""

import requests
import json
import time
import sys
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"

class InsightXTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        
    def log_test(self, test_name, status, message, recommendation=None):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "recommendation": recommendation
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {message}")
        if recommendation:
            print(f"   💡 {recommendation}")
        print()

    def test_backend_health(self):
        """Test backend health endpoints"""
        try:
            # Test main health endpoint
            response = self.session.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Health", "PASS", 
                            f"Backend running - {data.get('message', 'OK')}")
            else:
                self.log_test("Backend Health", "FAIL", 
                            f"Health endpoint returned {response.status_code}")
                return False
                
            # Test database health
            response = self.session.get(f"{BASE_URL}/health/db", timeout=5)
            if response.status_code == 200:
                data = response.json()
                collections = data.get('collections', [])
                self.log_test("Database Health", "PASS", 
                            f"Database connected - {len(collections)} collections")
            else:
                self.log_test("Database Health", "FAIL", 
                            f"DB health endpoint returned {response.status_code}")
                
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Health", "FAIL", 
                        f"Cannot connect to backend: {e}",
                        "Start backend: cd backend && uvicorn app.main:app --reload")
            return False

    def test_frontend_availability(self):
        """Test if frontend is accessible"""
        try:
            response = self.session.get(FRONTEND_URL, timeout=5)
            if response.status_code == 200:
                self.log_test("Frontend Availability", "PASS", 
                            "Frontend is accessible")
                return True
            else:
                self.log_test("Frontend Availability", "FAIL", 
                            f"Frontend returned {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Frontend Availability", "FAIL", 
                        f"Cannot connect to frontend: {e}",
                        "Start frontend: cd frontend && npm run dev")
            return False

    def test_user_registration(self):
        """Test user registration functionality"""
        try:
            test_user = {
                "name": "Test User",
                "email": f"test_{int(time.time())}@example.com",
                "password": "TestPassword123!"
            }
            
            response = self.session.post(f"{BASE_URL}/auth/register", 
                                       json=test_user, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("User Registration", "PASS", 
                            f"Registration successful - {data.get('message', 'OK')}")
                return test_user
            elif response.status_code == 400:
                error_detail = response.json().get('detail', 'Unknown error')
                if 'already registered' in error_detail:
                    self.log_test("User Registration", "PASS", 
                                "Registration validation working (email already exists)")
                    return test_user
                else:
                    self.log_test("User Registration", "FAIL", 
                                f"Registration failed: {error_detail}")
            else:
                self.log_test("User Registration", "FAIL", 
                            f"Registration returned {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("User Registration", "FAIL", 
                        f"Registration request failed: {e}")
        
        return None

    def test_user_login(self, user_data):
        """Test user login functionality"""
        if not user_data:
            self.log_test("User Login", "SKIP", "No user data available")
            return False
            
        try:
            login_data = {
                "username": user_data["email"],
                "password": user_data["password"]
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login", 
                                       data=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access_token')
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                self.log_test("User Login", "PASS", 
                            f"Login successful - Token received")
                return True
            else:
                error_detail = response.json().get('detail', 'Unknown error')
                self.log_test("User Login", "FAIL", 
                            f"Login failed: {error_detail}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("User Login", "FAIL", 
                        f"Login request failed: {e}")
        
        return False

    def test_dataset_endpoints(self):
        """Test dataset-related endpoints"""
        if not self.token:
            self.log_test("Dataset Endpoints", "SKIP", "No authentication token")
            return
            
        try:
            # Test get datasets
            response = self.session.get(f"{BASE_URL}/datasets/", timeout=10)
            
            if response.status_code == 200:
                datasets = response.json()
                self.log_test("Get Datasets", "PASS", 
                            f"Retrieved {len(datasets)} datasets")
                
                # Test analytics if datasets exist
                if datasets:
                    dataset_id = datasets[0].get('dataset_id')
                    if dataset_id:
                        self.test_analytics_endpoint(dataset_id)
                else:
                    self.log_test("Analytics Test", "SKIP", 
                                "No datasets available for analytics test")
            else:
                self.log_test("Get Datasets", "FAIL", 
                            f"Get datasets returned {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Dataset Endpoints", "FAIL", 
                        f"Dataset request failed: {e}")

    def test_analytics_endpoint(self, dataset_id):
        """Test analytics endpoint with a specific dataset"""
        try:
            response = self.session.get(f"{BASE_URL}/analytics/{dataset_id}/summary", 
                                      timeout=30)
            
            if response.status_code == 200:
                analytics = response.json()
                summary = analytics.get('summary', {})
                rows = summary.get('total_rows', 0)
                cols = summary.get('total_columns', 0)
                self.log_test("Analytics Generation", "PASS", 
                            f"Analytics generated - {rows} rows, {cols} columns")
                
                # Check for NaN issues
                analytics_str = json.dumps(analytics)
                if 'nan' in analytics_str.lower() or 'null' in analytics_str:
                    self.log_test("Analytics Data Quality", "WARN", 
                                "Analytics contains null/NaN values",
                                "Check data cleaning and NaN handling")
                else:
                    self.log_test("Analytics Data Quality", "PASS", 
                                "Analytics data is clean")
                    
            elif response.status_code == 404:
                self.log_test("Analytics Generation", "WARN", 
                            "Dataset not found (may have been deleted)")
            else:
                self.log_test("Analytics Generation", "FAIL", 
                            f"Analytics returned {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Analytics Generation", "FAIL", 
                        f"Analytics request failed: {e}")

    def test_api_documentation(self):
        """Test if API documentation is available"""
        try:
            response = self.session.get(f"{BASE_URL}/docs", timeout=5)
            if response.status_code == 200:
                self.log_test("API Documentation", "PASS", 
                            "FastAPI docs available at /docs")
            else:
                self.log_test("API Documentation", "FAIL", 
                            f"API docs returned {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_test("API Documentation", "FAIL", 
                        f"Cannot access API docs: {e}")

    def test_cors_configuration(self):
        """Test CORS configuration"""
        try:
            headers = {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            response = self.session.options(f"{BASE_URL}/auth/register", 
                                          headers=headers, timeout=5)
            
            cors_headers = response.headers
            if 'Access-Control-Allow-Origin' in cors_headers:
                self.log_test("CORS Configuration", "PASS", 
                            "CORS headers present")
            else:
                self.log_test("CORS Configuration", "WARN", 
                            "CORS headers missing",
                            "Check CORS middleware configuration")
                
        except requests.exceptions.RequestException as e:
            self.log_test("CORS Configuration", "FAIL", 
                        f"CORS test failed: {e}")

    def check_file_structure(self):
        """Check if essential files exist"""
        essential_files = [
            "backend/app/main.py",
            "backend/app/auth/routes.py",
            "backend/app/datasets/routes.py",
            "backend/app/analytics/routes.py",
            "backend/requirements.txt",
            "frontend/src/App.jsx",
            "frontend/src/api/api.js",
            "frontend/package.json",
            ".env.example",
            "README.md"
        ]
        
        missing_files = []
        for file_path in essential_files:
            if not Path(file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            self.log_test("File Structure", "WARN", 
                        f"Missing {len(missing_files)} essential files",
                        f"Missing: {', '.join(missing_files)}")
        else:
            self.log_test("File Structure", "PASS", 
                        "All essential files present")

    def run_comprehensive_test(self):
        """Run all tests"""
        print("🧪 InsightX Comprehensive Test Suite")
        print("=" * 50)
        
        # Infrastructure tests
        backend_ok = self.test_backend_health()
        frontend_ok = self.test_frontend_availability()
        
        if not backend_ok:
            print("\n❌ Backend not available - skipping API tests")
            self.generate_report()
            return
        
        # API tests
        self.test_api_documentation()
        self.test_cors_configuration()
        
        # Authentication tests
        user_data = self.test_user_registration()
        login_ok = self.test_user_login(user_data)
        
        # Dataset and analytics tests
        if login_ok:
            self.test_dataset_endpoints()
        
        # File structure test
        self.check_file_structure()
        
        # Generate report
        self.generate_report()

    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n📊 Test Results Summary")
        print("=" * 50)
        
        passed = sum(1 for r in self.test_results if r['status'] == 'PASS')
        failed = sum(1 for r in self.test_results if r['status'] == 'FAIL')
        warnings = sum(1 for r in self.test_results if r['status'] == 'WARN')
        skipped = sum(1 for r in self.test_results if r['status'] == 'SKIP')
        
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"⏭️  Skipped: {skipped}")
        print(f"📊 Total: {total}")
        
        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        # Recommendations
        recommendations = [r for r in self.test_results if r.get('recommendation')]
        if recommendations:
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(recommendations, 1):
                print(f"{i}. {rec['test']}: {rec['recommendation']}")
        
        # Overall assessment
        print(f"\n🏆 Overall Assessment:")
        if failed == 0 and warnings <= 1:
            print("🟢 EXCELLENT - Your InsightX platform is working perfectly!")
        elif failed <= 1 and warnings <= 2:
            print("🟡 GOOD - Minor issues that should be addressed")
        elif failed <= 2:
            print("🟠 NEEDS ATTENTION - Several issues need fixing")
        else:
            print("🔴 CRITICAL - Major issues preventing proper operation")
        
        # Save detailed report
        with open('test_report.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        print(f"\n📄 Detailed report saved to: test_report.json")

def main():
    tester = InsightXTester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()