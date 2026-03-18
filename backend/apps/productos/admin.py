import nested_admin
from django.contrib import admin
from .models import Producto, ImagenDimension
from apps.colores.models import ColorProducto
from apps.imagenProducto.models import ImagenProducto


class ImagenProductoInline(nested_admin.NestedTabularInline):
    model = ImagenProducto
    extra = 1


class ColorProductoInline(nested_admin.NestedTabularInline):
    model = ColorProducto
    extra = 1
    inlines = [ImagenProductoInline]


class ImagenDimensionInline(nested_admin.NestedTabularInline):
    model = ImagenDimension
    extra = 1
    fields = ['imagen', 'descripcion', 'orden']


class ProductoAdmin(nested_admin.NestedModelAdmin):
    list_display = ('nombre', 'precio', 'categoria', 'stock')
    inlines = [ColorProductoInline, ImagenDimensionInline]
    # Agrupa los campos de dimensiones en una sección aparte
    fieldsets = (
        (None, {
            'fields': (
                'nombre', 'descripcion', 'precio',
                'categoria', 'stock',
                'modelo_glb', 'modelo_usdz',
            )
        }),
        ('Dimensiones', {
            'fields': ('alto', 'ancho', 'profundidad', 'peso', 'material'),
            'classes': ('collapse',),
        }),
    )


admin.site.register(Producto, ProductoAdmin)