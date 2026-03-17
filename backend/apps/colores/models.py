from django.db import models
from apps.productos.models import Producto
from cloudinary.models import CloudinaryField  # ← añadir


class ColorProducto(models.Model):

    producto = models.ForeignKey(
        Producto,
        related_name="colores",
        on_delete=models.CASCADE
    )

    nombre = models.CharField(max_length=50)

    codigo_hex = models.CharField(
        max_length=7,
        blank=True,
        null=True
    )

    imagen = CloudinaryField(            # ← cambiar ImageField por CloudinaryField
        "imagen",
        folder="colores/",
        blank=True,
        null=True
    )

    def save(self, *args, **kwargs):
        colores = {
            "negro": "#000000",
            "blanco": "#FFFFFF",
            "rojo": "#FF0000",
            "azul": "#0000FF",
            "verde": "#008000",
            "gris": "#808080",
            "beige": "#F5F5DC",
            "cafe": "#6F4E37",
            "marron": "#8B4513",
        }
        if not self.codigo_hex:
            self.codigo_hex = colores.get(self.nombre.lower(), "#cccccc")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre