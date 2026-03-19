# apps/envio/views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from .models import Envio
from .serializers import EnvioSerializer


class EnvioCreateView(generics.CreateAPIView):
    serializer_class = EnvioSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        envio = serializer.save()
        pedido = envio.pedido
        usuario = pedido.usuario
        items = pedido.items.select_related("producto").all()

        detalle = "\n".join(
            f"  • {item.producto.nombre} x{item.cantidad}"
            for item in items
        )

        correo_cliente = getattr(usuario, "correo", None) or getattr(usuario, "email", None)

        direccion_completa = (
            f"  Dirección:     {envio.direccion}\n"
            f"  Ciudad:        {envio.ciudad}\n"
            f"  Departamento:  {envio.estado}\n"
            f"  Código postal: {envio.codigo_postal}"
        )

        # ── Correo al cliente ──────────────────────────────
        try:
            send_mail(
                "¡Pedido confirmado! – Mestizo Mobiliario",
                f"""
Hola {usuario.nombre},

¡Gracias por tu compra en Mestizo Mobiliario!

Hemos recibido tu pedido #{pedido.id} correctamente.

Detalle de tu pedido:
{detalle}

Total: ${pedido.total:,.0f} COP

Datos de envío:
{direccion_completa}

Pronto uno de nuestros asesores se comunicará contigo para coordinar la entrega.

Si tienes alguna inquietud, puedes escribirnos directamente.

Con gusto,
El equipo de Mestizo Mobiliario
— Estudio de Mobiliario Artesanal —
                """,
                settings.DEFAULT_FROM_EMAIL,
                [correo_cliente],
                fail_silently=True,
            )
        except Exception:
            pass

        # ── Correo al admin ────────────────────────────────
        try:
            send_mail(
                f"Nuevo pedido #{pedido.id} — {usuario.nombre} {getattr(usuario, 'primerApellido', '')}",
                f"""
Nuevo pedido registrado en Mestizo Mobiliario.

Cliente:  {usuario.nombre} {getattr(usuario, 'primerApellido', '')} {getattr(usuario, 'segundoApellido', '')}
Correo:   {correo_cliente}

Pedido #: {pedido.id}

Detalle:
{detalle}

Total: ${pedido.total:,.0f} COP

Datos de envío:
{direccion_completa}
                """,
                settings.DEFAULT_FROM_EMAIL,
                ['giraldocamila2004@gmail.com'],
                fail_silently=True,
            )
        except Exception:
            pass