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

                # Si el usuario no existe lo crea
                if not usuario:

                    usuario = Usuario.objects.create_user(
                        identificacion=data.get("identificacion"),
                        nombre=data.get("nombre"),
                        primerApellido=data.get("primerApellido"),
                        segundoApellido=data.get("segundoApellido"),
                        correo=data.get("correo"),
                        telefono=data.get("telefono"),
                        password="Temporal123"
                    )

                # Crear cita
                cita = Cita.objects.create(
                    usuario=usuario,
                    fecha=data.get("fecha"),
                    hora=data.get("hora"),
                    descripcion=data.get("descripcion")
                )

                serializer = CitaSerializer(cita)
                response_data = serializer.data

            try:
                send_mail(
                    "Solicitud recibida – Mestizo Mobiliario",
                    f"""
Hola {usuario.nombre},

¡Bienvenido a Mestizo Mobiliario!

Hemos recibido tu información correctamente y queremos agradecerte por el interés que depositas en nosotros. Para nosotros es un honor acompañarte en la creación de espacios con carácter.

Tu solicitud de cita ha sido registrada con los siguientes detalles:

  Fecha solicitada: {cita.fecha}
  Hora solicitada:  {cita.hora}

En breve uno de nuestros asesores se comunicará contigo para confirmar tu cita y resolver cualquier inquietud que tengas.

Si deseas comunicarte con nosotros antes, puedes escribirnos directamente y con gusto te atendemos.

Gracias por confiar en Mestizo Mobiliario.

Con gusto,
El equipo de Mestizo Mobiliario
— Estudio de Mobiliario Artesanal —
                    """,
                    settings.DEFAULT_FROM_EMAIL,
                    [usuario.correo],
                    fail_silently=True,
                )
            except Exception:
                pass

            # Correo al admin — FUERA del transaction
            try:
                send_mail(
                    f"Nueva solicitud de cita — {usuario.nombre} {usuario.primerApellido}",
                    f"""
Nueva solicitud de cita registrada en Mestizo Mobiliario.

Cliente:        {usuario.nombre} {usuario.primerApellido} {usuario.segundoApellido}
Identificación: {usuario.identificacion}
Correo:         {usuario.correo}
Teléfono:       {usuario.telefono}

Fecha solicitada: {cita.fecha}
Hora solicitada:  {cita.hora}

Descripción:
{cita.descripcion}
                    """,
                    settings.DEFAULT_FROM_EMAIL,
                    ['giraldocamila2004@gmail.com'],
                    fail_silently=True,
                )
            except Exception:
                pass

            return Response(response_data, status=status.HTTP_201_CREATED)

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
    }

    return Response(data)