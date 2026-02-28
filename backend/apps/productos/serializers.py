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
    categoria_nombre = serializers.CharField(
        source='categoria.nombre',
        read_only=True
    )

    imagenes = ImagenProductoSerializer(
        many=True,
        read_only=True
    )

    modelo_glb = serializers.FileField(read_only=True)
    modelo_usdz = serializers.FileField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id',
            'codigo',
            'nombre',
            'descripcion',
            'precio',
            'stock',
            'categoria',
            'categoria_nombre',
            'imagenes',
            'modelo_glb',     
            'modelo_usdz'     
        ]
