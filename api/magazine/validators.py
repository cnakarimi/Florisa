from django.core.exceptions import ValidationError


def validate_article_content(value) -> None:
    """Validate only the block envelope; new block types need no schema change."""
    if not isinstance(value, list):
        raise ValidationError("محتوا باید یک آرایه از بلوک‌ها باشد.")

    for block in value:
        if (
            not isinstance(block, dict)
            or not isinstance(block.get("type"), str)
            or not block["type"].strip()
        ):
            raise ValidationError("هر بلوک باید یک شیء با نوع متنی غیرخالی باشد.")
        if "text" in block and not isinstance(block["text"], str):
            raise ValidationError("فیلد text در بلوک باید متن باشد.")
