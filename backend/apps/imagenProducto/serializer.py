from rest_framework import serializers
from .models import ImagenProducto


class ImagenProductoSerializer(serializers.ModelSerializer):

    imagen = serializers.SerializerMethodField()

    class Meta:
        model = ImagenProducto
        fields = ["imagen", "orden"]
        fields = [
            "id",
            "color",
            "imagen",
            "orden"
        ]

    def get_imagen(self, obj):
        return obj.imagen.url if obj.imagen else None
        if obj.imagen:
            return obj.imagen.url
        return None
