from rest_framework import serializers
from cloudinary.utils import cloudinary_url
from cloudinary.uploader import upload
from .models import ColorProducto
from apps.imagenProducto.serializer import ImagenProductoSerializer


class ColorSerializer(serializers.ModelSerializer):

    imagen_url  = serializers.SerializerMethodField()
    imagenes    = ImagenProductoSerializer(many=True, read_only=True)
    imagen      = serializers.SerializerMethodField()
    imagen_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = ColorProducto
        fields = [
            'id',
            'producto',
            'nombre',
            'imagen',
            'imagen_url',
            'imagen_file',
            'codigo_hex',
            'imagenes',
        ]

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

    def get_imagen_url(self, obj):
        return self.get_imagen(obj)

    def create(self, validated_data):
        imagen_file = validated_data.pop("imagen_file", None)
        instance = ColorProducto(**validated_data)
        if imagen_file:
            result = upload(imagen_file, resource_type="image", folder="colores/")
            instance.imagen = result["public_id"]
        instance.save()
        return instance

    def update(self, instance, validated_data):
        imagen_file = validated_data.pop("imagen_file", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if imagen_file:
            result = upload(imagen_file, resource_type="image", folder="colores/")
            instance.imagen = result["public_id"]
        instance.save()
        return instance