import unittest

from app import app


class ContactPageTests(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def test_contact_form_uses_normal_html_post(self):
        response = self.client.get("/contact")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b'<form method="post" action="/contact/submit"', response.data)

    def test_contact_success_page_is_available(self):
        response = self.client.get("/contact-sent")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Message sent", response.data)

    def test_contact_error_page_is_available(self):
        response = self.client.get("/contact-error")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"couldn't send", response.data)


if __name__ == "__main__":
    unittest.main()
