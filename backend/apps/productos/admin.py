from django.contrib import admin
from .models import Producto
from apps.imagenProducto.models import ImagenProducto

# Inline para las imágenes
class ImagenProductoInline(admin.TabularInline):  # TabularInline muestra en tabla, StackedInline es más grande
    model = ImagenProducto
    extra = 1  # cuántas imágenes adicionales se muestran por defecto
    fields = ('imagen',)  # campos que se muestran
    # readonly_fields = ('imagen_tag',)  # opcional si quieres mostrar una miniatura

class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'categoria', 'stock')
    list_filter = ('categoria',)
    search_fields = ('nombre', 'descripcion')
    inlines = [ImagenProductoInline]  # <-- aquí añadimos el inline

admin.site.register(Producto, ProductoAdmin)
