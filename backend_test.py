import requests
import sys
from datetime import datetime
import json

class BlueMillAPITester:
    def __init__(self, base_url="https://artisan-connect-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.results.append({'test': name, 'status': 'PASS', 'details': f'Status: {response.status_code}'})
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_details = response.text
                except:
                    error_details = "No response content"
                self.results.append({'test': name, 'status': 'FAIL', 'details': f'Expected {expected_status}, got {response.status_code}. Response: {error_details}'})
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.results.append({'test': name, 'status': 'FAIL', 'details': f'Exception: {str(e)}'})
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_auth_verify(self):
        """Test auth verification"""
        if not self.token:
            print("❌ No token available for auth verification")
            return False
        
        success, response = self.run_test(
            "Auth Verification",
            "GET",
            "auth/verify",
            200
        )
        return success

    def test_get_job_types(self):
        """Test get job types"""
        success, response = self.run_test(
            "Get Job Types",
            "GET",
            "job-types",
            200
        )
        return success, response.get('job_types', []) if success else []

    def test_get_artisans(self):
        """Test get all artisans"""
        success, response = self.run_test(
            "Get All Artisans",
            "GET",
            "artisans",
            200
        )
        return success, response if success else []

    def test_create_artisan(self):
        """Test creating an artisan"""
        artisan_data = {
            "name": "Test Artisan",
            "phone": "08012345678",
            "location": "Wuse, Abuja",
            "job_type": "Electrician",
            "photo_url": "https://example.com/photo.jpg"
        }
        
        success, response = self.run_test(
            "Create Artisan",
            "POST",
            "artisans",
            200,
            data=artisan_data
        )
        return response.get('id') if success else None

    def test_get_artisan_by_id(self, artisan_id):
        """Test getting artisan by ID"""
        success, response = self.run_test(
            "Get Artisan by ID",
            "GET",
            f"artisans/{artisan_id}",
            200
        )
        return success

    def test_update_artisan(self, artisan_id):
        """Test updating artisan"""
        update_data = {
            "name": "Updated Test Artisan",
            "location": "Garki, Abuja"
        }
        
        success, response = self.run_test(
            "Update Artisan",
            "PUT",
            f"artisans/{artisan_id}",
            200,
            data=update_data
        )
        return success

    def test_worker_submission(self):
        """Test worker submission"""
        submission_data = {
            "name": "Test Worker",
            "phone": "08087654321",
            "location": "Maitama, Abuja",
            "job_type": "Mechanic"
        }
        
        success, response = self.run_test(
            "Create Worker Submission",
            "POST",
            "submissions",
            200,
            data=submission_data
        )
        return response.get('id') if success else None

    def test_get_submissions(self):
        """Test getting submissions (admin only)"""
        success, response = self.run_test(
            "Get Submissions",
            "GET",
            "submissions",
            200
        )
        return success, response if success else []

    def test_approve_submission(self, submission_id):
        """Test approving submission"""
        success, response = self.run_test(
            "Approve Submission",
            "PUT",
            f"submissions/{submission_id}/approve",
            200
        )
        return success

    def test_create_review(self, artisan_id):
        """Test creating a review"""
        review_data = {
            "artisan_id": artisan_id,
            "user_name": "Test User",
            "rating": 5,
            "comment": "Excellent work!"
        }
        
        success, response = self.run_test(
            "Create Review",
            "POST",
            "reviews",
            200,
            data=review_data
        )
        return success

    def test_get_reviews(self, artisan_id):
        """Test getting reviews for an artisan"""
        success, response = self.run_test(
            "Get Reviews",
            "GET",
            f"reviews/{artisan_id}",
            200
        )
        return success

    def test_delete_artisan(self, artisan_id):
        """Test deleting an artisan"""
        success, response = self.run_test(
            "Delete Artisan",
            "DELETE",
            f"artisans/{artisan_id}",
            200
        )
        return success

def main():
    print("🚀 Starting Blue Mill API Tests...")
    
    tester = BlueMillAPITester()
    
    # Test 1: Admin Authentication
    print("\n=== AUTHENTICATION TESTS ===")
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
    
    if not tester.test_auth_verify():
        print("❌ Auth verification failed")
        return 1

    # Test 2: Job Types
    print("\n=== JOB TYPES TESTS ===")
    success, job_types = tester.test_get_job_types()
    if not success:
        print("❌ Failed to get job types")
        return 1
    print(f"✅ Found {len(job_types)} job types: {', '.join(job_types[:5])}")

    # Test 3: Artisans CRUD
    print("\n=== ARTISANS CRUD TESTS ===")
    
    # Get existing artisans
    success, existing_artisans = tester.test_get_artisans()
    if not success:
        print("❌ Failed to get artisans")
        return 1
    print(f"✅ Found {len(existing_artisans)} existing artisans")
    
    # Create new artisan
    artisan_id = tester.test_create_artisan()
    if not artisan_id:
        print("❌ Failed to create artisan")
        return 1
    print(f"✅ Created artisan with ID: {artisan_id}")
    
    # Get artisan by ID
    if not tester.test_get_artisan_by_id(artisan_id):
        print("❌ Failed to get artisan by ID")
        return 1
    
    # Update artisan
    if not tester.test_update_artisan(artisan_id):
        print("❌ Failed to update artisan")
        return 1

    # Test 4: Reviews
    print("\n=== REVIEWS TESTS ===")
    if not tester.test_create_review(artisan_id):
        print("❌ Failed to create review")
        return 1
    
    if not tester.test_get_reviews(artisan_id):
        print("❌ Failed to get reviews")
        return 1

    # Test 5: Worker Submissions
    print("\n=== WORKER SUBMISSIONS TESTS ===")
    submission_id = tester.test_worker_submission()
    if not submission_id:
        print("❌ Failed to create worker submission")
        return 1
    print(f"✅ Created submission with ID: {submission_id}")
    
    # Get submissions
    success, submissions = tester.test_get_submissions()
    if not success:
        print("❌ Failed to get submissions")
        return 1
    print(f"✅ Found {len(submissions)} submissions")
    
    # Approve submission
    if not tester.test_approve_submission(submission_id):
        print("❌ Failed to approve submission")
        return 1

    # Test 6: Cleanup - Delete test artisan
    print("\n=== CLEANUP TESTS ===")
    if not tester.test_delete_artisan(artisan_id):
        print("❌ Failed to delete test artisan")
        return 1

    # Print final results
    print(f"\n📊 Final Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        print("\nFailed tests:")
        for result in tester.results:
            if result['status'] == 'FAIL':
                print(f"- {result['test']}: {result['details']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())