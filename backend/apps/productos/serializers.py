from rest_framework import serializers
from .models import Producto
from apps.imagenProducto.models import ImagenProducto

# Serializer para las imágenes
class ImagenProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenProducto
        fields = ['imagen']

# Serializer de productos con imágenes incluidas
class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    imagenes = ImagenProductoSerializer(many=True, read_only=True)  # <-- agregar imágenes

    class Meta:
        model = Producto
        fields = ['codigo', 'nombre', 'descripcion', 'precio', 'stock', 'categoria', 'categoria_nombre', 'imagenes']
