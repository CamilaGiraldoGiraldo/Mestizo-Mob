from rest_framework import serializers
from .models import ColorProducto
from apps.imagenProducto.serializer import ImagenProductoSerializer


class ColorSerializer(serializers.ModelSerializer):

    imagen = serializers.SerializerMethodField()
    imagenes = ImagenProductoSerializer(many=True, read_only=True)

    class Meta:
        model = ColorProducto
        fields = ['nombre', 'imagen', 'codigo_hex', 'imagenes']

    def get_imagen(self, obj):
        return obj.imagen.url if obj.imagen else None