from django.utils.html import mark_safe
from .models import ImagenProducto
from django.contrib import admin

class ImagenProductoAdmin(admin.ModelAdmin):
    list_display = ('producto', 'imagen_tag')

    def imagen_tag(self, obj):
        if obj.imagen:
            return mark_safe(f'<img src="{obj.imagen.url}" width="100" />')
        return "-"
    imagen_tag.short_description = 'Imagen'

admin.site.register(ImagenProducto, ImagenProductoAdmin)
