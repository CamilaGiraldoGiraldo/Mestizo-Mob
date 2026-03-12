# apps/citas/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Cita
from .serializers import CitaSerializer
from apps.usuario.models import Usuario  # 🔹 asegúrate de este path
from django.db import transaction

class CitaCreateView(generics.CreateAPIView):
    serializer_class = CitaSerializer

    @transaction.atomic  # asegura que todo se haga o nada
    def post(self, request, *args, **kwargs):
        data = request.data
        # campos del usuario que vienen en el request
        correo = data.get('correo')
        identificacion = data.get('identificacion')
        nombre = data.get('nombre')
        primerApellido = data.get('primerApellido')
        segundoApellido = data.get('segundoApellido')
        telefono = data.get('telefono')
        direccion = data.get('direccion')
        password = data.get('password', '1234')  # 🔹 contraseña por defecto si no viene

        # 1️⃣ Crear usuario si no existe
        usuario, created = Usuario.objects.get_or_create(
            correo=correo,
            defaults={
                'identificacion': identificacion,
                'nombre': nombre,
                'primerApellido': primerApellido,
                'segundoApellido': segundoApellido,
                'telefono': telefono,
                'direccion': direccion,
            }
        )
        if created:
            usuario.set_password(password)
            usuario.save()

        # 2️⃣ Crear la cita
        cita_data = {
            'usuario': usuario.pk,  # 🔹 relación con FK
            'fecha': data.get('fecha'),
            'hora': data.get('hora'),
            'asunto': data.get('asunto')
        }
        serializer = self.get_serializer(data=cita_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)