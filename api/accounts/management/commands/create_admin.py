import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction

from accounts.utils import normalize_phone, validate_iranian_phone


REQUIRED_ENVIRONMENT_VARIABLES = (
    "FLORISA_ADMIN_PHONE",
    "FLORISA_ADMIN_PASSWORD",
    "FLORISA_ADMIN_FULL_NAME",
)


class Command(BaseCommand):
    help = "Create the first Florisa admin from environment variables."

    def handle(self, *args, **options):
        values = {
            name: os.getenv(name, "")
            for name in REQUIRED_ENVIRONMENT_VARIABLES
        }
        missing = [
            name for name, value in values.items() if not value.strip()
        ]
        if missing:
            raise CommandError(
                "Missing required environment variable(s): "
                + ", ".join(missing),
            )

        phone = normalize_phone(values["FLORISA_ADMIN_PHONE"])
        password = values["FLORISA_ADMIN_PASSWORD"]
        full_name = values["FLORISA_ADMIN_FULL_NAME"].strip()
        email = os.getenv("FLORISA_ADMIN_EMAIL", "").strip() or None

        try:
            validate_iranian_phone(phone)
        except ValidationError as error:
            raise CommandError(
                "FLORISA_ADMIN_PHONE is invalid: " + "; ".join(error.messages),
            ) from error

        user_model = get_user_model()
        if user_model.objects.filter(phone=phone).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"Admin bootstrap skipped: a user with phone {phone} already exists.",
                ),
            )
            return

        try:
            if email:
                validate_email(email)
            password_candidate = user_model(
                phone=phone,
                full_name=full_name,
                email=email,
            )
            validate_password(password, user=password_candidate)
        except ValidationError as error:
            raise CommandError(
                "Invalid admin configuration: " + "; ".join(error.messages),
            ) from error

        try:
            with transaction.atomic():
                user_model.objects.create_superuser(
                    phone=phone,
                    password=password,
                    full_name=full_name,
                    email=email,
                )
        except IntegrityError as error:
            if user_model.objects.filter(phone=phone).exists():
                self.stdout.write(
                    self.style.WARNING(
                        f"Admin bootstrap skipped: a user with phone {phone} already exists.",
                    ),
                )
                return
            raise CommandError("Could not create the admin user.") from error

        self.stdout.write(
            self.style.SUCCESS(
                f"Florisa admin created successfully for phone {phone}.",
            ),
        )
