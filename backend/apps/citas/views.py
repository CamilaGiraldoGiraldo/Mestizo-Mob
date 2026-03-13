from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db import transaction

from .models import Cita
from .serializers import CitaSerializer
from apps.usuario.models import Usuario


class CitaCreateView(generics.CreateAPIView):

    serializer_class = CitaSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):

        data = request.data

        correo = data.get('correo')

        usuario, created = Usuario.objects.get_or_create(
            correo=correo,
            defaults={
                'identificacion': data.get('identificacion'),
                'nombre': data.get('nombre'),
                'primerApellido': data.get('primerApellido'),
                'segundoApellido': data.get('segundoApellido'),
                'telefono': data.get('telefono'),
                'direccion': data.get('direccion'),
            }
        )

        if created:
            usuario.set_password("1234")
            usuario.save()

        cita = Cita.objects.create(
            usuario=usuario,
            fecha=data.get('fecha'),
            hora=data.get('hora'),
            descripcion=data.get('descripcion')
        )

        serializer = CitaSerializer(cita)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def buscar_usuario(request):

    correo = request.GET.get('correo')

    try:

        usuario = Usuario.objects.get(correo=correo)

        data = {
            "identificacion": usuario.identificacion,
            "nombre": usuario.nombre,
            "primerApellido": usuario.primerApellido,
            "segundoApellido": usuario.segundoApellido,
            "telefono": usuario.telefono,
            "direccion": usuario.direccion,
            "correo": usuario.correo
        }

        return Response(data)

    except Usuario.DoesNotExist:

        return Response({"mensaje": "Usuario no encontrado"}, status=404)