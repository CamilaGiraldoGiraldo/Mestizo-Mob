from django.db import models
from cloudinary.models import CloudinaryField
from apps.colores.models import ColorProducto


class ImagenProducto(models.Model):

    color = models.ForeignKey(
        ColorProducto,
        related_name="imagenes",
        on_delete=models.CASCADE
    )

    imagen = CloudinaryField("imagen", resource_type="image")  # ← solo una vez

    orden = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.color.nombre} - {self.orden}"