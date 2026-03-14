from django.contrib import admin
from .models import ImagenProducto


class ImagenProductoAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "color",
        "imagen",
        "orden"
    )


admin.site.register(ImagenProducto, ImagenProductoAdmin)