from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view

from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings

from apps.usuario.models import Usuario
from .models import Cita
from .serializers import CitaSerializer


class CitaCreateView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        data = request.data

        try:

            with transaction.atomic():

                identificacion = data.get("identificacion")

                usuario = Usuario.objects.filter(
                    identificacion=identificacion
                ).first()

                if not usuario:

                    usuario = Usuario.objects.create_user(
                        identificacion=data.get("identificacion"),
                        nombre=data.get("nombre"),
                        primerApellido=data.get("primerApellido"),
                        segundoApellido=data.get("segundoApellido"),
                        correo=data.get("correo"),
                        telefono=data.get("telefono"),
                        direccion=data.get("direccion"),
                        password="Temporal123"
                    )

                cita = Cita.objects.create(
                    usuario=usuario,
                    fecha=data.get("fecha"),
                    hora=data.get("hora"),
                    descripcion=data.get("descripcion")
                )

                # ENVIAR CORREO
                send_mail(
                    "Confirmación de cita",
                    f"""
Hola {usuario.nombre},

Tu cita fue agendada correctamente.

Fecha: {cita.fecha}
Hora: {cita.hora}

Gracias por utilizar nuestro sistema.
                    """,
                    settings.DEFAULT_FROM_EMAIL,
                    [usuario.correo],
                    fail_silently=False,
                )

                serializer = CitaSerializer(cita)

                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET"])
def buscar_usuario(request):

    identificacion = request.GET.get("identificacion")

    if not identificacion:
        return Response({})

    usuario = Usuario.objects.filter(
        identificacion=identificacion
    ).first()

    if not usuario:
        return Response({})

    data = {

        "identificacion": usuario.identificacion,
        "nombre": usuario.nombre,
        "primerApellido": usuario.primerApellido,
        "segundoApellido": usuario.segundoApellido,
        "correo": usuario.correo,
        "telefono": usuario.telefono,
        "direccion": usuario.direccion

    }

    return Response(data)