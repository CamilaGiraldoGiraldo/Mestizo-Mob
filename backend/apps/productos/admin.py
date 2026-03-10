import nested_admin
from django.contrib import admin
from .models import Producto
from apps.colores.models import ColorProducto
from apps.imagenProducto.models import ImagenProducto


class ImagenProductoInline(nested_admin.NestedTabularInline):
    model = ImagenProducto
    extra = 1


class ColorProductoInline(nested_admin.NestedTabularInline):
    model = ColorProducto
    extra = 1
    inlines = [ImagenProductoInline]


class ProductoAdmin(nested_admin.NestedModelAdmin):
    list_display = ('nombre', 'precio', 'categoria', 'stock')
    inlines = [ColorProductoInline]


admin.site.register(Producto, ProductoAdmin)