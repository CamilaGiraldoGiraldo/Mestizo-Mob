from rest_framework import serializers
from .models import ColorProducto
from apps.imagenProducto.serializer import ImagenProductoSerializer


class ColorSerializer(serializers.ModelSerializer):

    imagen = serializers.SerializerMethodField()
    imagenes = ImagenProductoSerializer(many=True, read_only=True)
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = ColorProducto
        fields = [
            'id',
            'producto',
            'nombre',
            'imagen',
            'imagen_url',
            'codigo_hex',
            'imagenes'
        ]

    def get_imagen(self, obj):
        return obj.imagen.url if obj.imagen else None

    def get_imagen_url(self, obj):
        return obj.imagen.url if obj.imagen else None