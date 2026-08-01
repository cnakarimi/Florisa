from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_email_alter_user_full_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="otprequest",
            name="is_demo",
            field=models.BooleanField(
                default=False,
                editable=False,
                verbose_name="درخواست نمایشی",
            ),
        ),
    ]
