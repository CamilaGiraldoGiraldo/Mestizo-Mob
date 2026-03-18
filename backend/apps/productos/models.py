from django.db import models
from apps.categorias.models import Categoria
from cloudinary.models import CloudinaryField


class Producto(models.Model):
    codigo = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=0)

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name='productos'
    )

    stock = models.PositiveIntegerField(default=0)

    modelo_glb = CloudinaryField(
        'modelo_glb',
        resource_type="raw",
        blank=True,
        null=True
    )

    modelo_usdz = CloudinaryField(
        'modelo_usdz',
        resource_type="raw",
        blank=True,
        null=True
    )

    # ── Dimensiones ──────────────────────────────
    alto = models.DecimalField(
        max_digits=6, decimal_places=1,
        blank=True, null=True,
        help_text="Alto en cm"
    )
    ancho = models.DecimalField(
        max_digits=6, decimal_places=1,
        blank=True, null=True,
        help_text="Ancho en cm"
    )
    profundidad = models.DecimalField(
        max_digits=6, decimal_places=1,
        blank=True, null=True,
        help_text="Profundidad en cm"
    )
    peso = models.DecimalField(
        max_digits=6, decimal_places=1,
        blank=True, null=True,
        help_text="Peso en kg"
    )
    material = models.CharField(
        max_length=200,
        blank=True, null=True,
        help_text="Ej: Madera de teca, cuero natural"
    )

    def save(self, *args, **kwargs):
        if not self.codigo:
            ultimo = Producto.objects.order_by('-id').first()
            if ultimo:
                numero = int(ultimo.codigo.split('-')[1]) + 1
            else:
                numero = 1
            self.codigo = f"MOB-{numero:06d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


# ── Imágenes de dimensiones (planos técnicos) ──
class ImagenDimension(models.Model):
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='imagenes_dimensiones'
    )
    imagen = CloudinaryField('imagen_dimension')
    descripcion = models.CharField(
        max_length=100,
        blank=True, null=True,
        help_text="Ej: Vista frontal, Vista superior"
    )
    orden = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['orden']

    def __str__(self):
        return f"Plano {self.orden} — {self.producto.nombre}"