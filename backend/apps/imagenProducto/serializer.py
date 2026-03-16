from rest_framework import serializers
from .models import ImagenProducto
from cloudinary.utils import cloudinary_url


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

