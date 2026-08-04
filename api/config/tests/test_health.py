from django.test import TestCase
from django.urls import reverse


class HealthEndpointTests(TestCase):
    def test_get_returns_exact_health_response(self):
        response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_get_is_accessible_without_authentication_or_session(self):
        response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("sessionid", response.cookies)

    def test_get_executes_zero_database_queries(self):
        with self.assertNumQueries(0):
            response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, 200)

    def test_head_is_supported(self):
        response = self.client.head(reverse("health"))

        self.assertEqual(response.status_code, 200)
