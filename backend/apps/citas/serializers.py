from rest_framework import serializers
from .models import Cita
from django.core.mail import send_mail
from django.conf import settings
from apps.usuario.models import Usuario


class CitaSerializer(serializers.ModelSerializer):

    nombre = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    telefono = serializers.CharField(write_only=True)

    class Meta:
        model = Cita
        fields = [
            'id',
            'nombre',
            'email',
            'telefono',
            'fecha',
            'hora',
            'mensaje',
            'estado'
        ]

    def create(self, validated_data):

        nombre = validated_data.pop('nombre')
        email = validated_data.pop('email')
        telefono = validated_data.pop('telefono')

        usuario, creado = Usuario.objects.get_or_create(
            email=email,
            defaults={
                'nombre': nombre,
                'telefono': telefono
            }
        )

        cita = Cita.objects.create(
            usuario=usuario,
            **validated_data
        )

        # enviar correo
        send_mail(
            subject="Confirmación de solicitud de cita",
            message=f"""
Hola {usuario.nombre},

Hemos recibido tu solicitud de cita para el día {cita.fecha} a las {cita.hora}.

Nuestro equipo se comunicará contigo para confirmar la cita.

Gracias por contactarnos.
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario.email],
            fail_silently=False,
        )

        return cita