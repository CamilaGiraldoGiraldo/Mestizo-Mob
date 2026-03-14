from rest_framework import serializers
from .models import ImagenProducto


class ImagenProductoSerializer(serializers.ModelSerializer):

    imagen = serializers.SerializerMethodField()

    class Meta:
        model = ImagenProducto
        fields = [
            "id",
            "color",
            "imagen",
            "orden"
        ]

    def get_imagen(self, obj):
        if obj.imagen:
            return obj.imagen.url
        return None