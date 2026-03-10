# apps/colores/admin.py

from django.contrib import admin
from .models import ColorProducto
from apps.imagenProducto.models import ImagenProducto


class ImagenProductoInline(admin.TabularInline):
    model = ImagenProducto
    extra = 1
    fields = ('imagen', 'orden')


class ColorProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'producto')
    inlines = [ImagenProductoInline]


admin.site.register(ColorProducto, ColorProductoAdmin)