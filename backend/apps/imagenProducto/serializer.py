from rest_framework import serializers
from cloudinary.uploader import upload
from cloudinary.utils import cloudinary_url
from .models import ImagenProducto


class ImagenProductoSerializer(serializers.ModelSerializer):

    imagen = serializers.SerializerMethodField()
    imagen_upload = serializers.ImageField(
        write_only=True, required=False
    )

    class Meta:
        model = ImagenProducto
        fields = ["id", "color", "imagen", "imagen_upload", "orden"]

    def get_imagen(self, obj):
        if not obj.imagen:
            return None
        try:
            return obj.imagen.url
        except AttributeError:
            raw = str(obj.imagen)
            if raw.startswith("http"):
                return raw
            url, _ = cloudinary_url(raw)
            return url

    def create(self, validated_data):
        imagen_file = validated_data.pop("imagen_upload", None)
        instance = ImagenProducto(**validated_data)
        if imagen_file:
            result = upload(imagen_file, resource_type="image")
            instance.imagen = result["public_id"]
        instance.save()
        return instance

    def update(self, instance, validated_data):
        imagen_file = validated_data.pop("imagen_upload", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if imagen_file:
            result = upload(imagen_file, resource_type="image")
            instance.imagen = result["public_id"]
        instance.save()
        return instance