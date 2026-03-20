import random
import string

from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token

from apps.usuario.models import Usuario, CodigoRecuperacion
from apps.usuario.serializers import UsuarioSerializer


def generar_contrasena_temporal(longitud=10):
    """Genera una contraseña temporal con letras y números."""
    caracteres = string.ascii_letters + string.digits
    return ''.join(random.choices(caracteres, k=longitud))


# ── ViewSet para el panel admin ───────────────────────────────
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('nombre')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


# ── Registro público ──────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def registro_view(request):
    campos_requeridos = [
        'identificacion', 'nombre', 'primerApellido',
        'segundoApellido', 'correo', 'telefono'
    ]
    errores = {}

    for campo in campos_requeridos:
        if not request.data.get(campo, '').strip():
            errores[campo] = 'Este campo es requerido.'

    if errores:
        return Response(errores, status=status.HTTP_400_BAD_REQUEST)

    correo = request.data.get('correo', '').strip().lower()
    if Usuario.objects.filter(correo=correo).exists():
        return Response(
            {'correo': 'Ya existe una cuenta con este correo.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    identificacion = request.data.get('identificacion', '').strip()
    if Usuario.objects.filter(identificacion=identificacion).exists():
        return Response(
            {'identificacion': 'Ya existe una cuenta con esta identificación.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Generar contraseña temporal
    contrasena_temporal = generar_contrasena_temporal()

    try:
        usuario = Usuario.objects.create_user(
            identificacion          = identificacion,
            nombre                  = request.data.get('nombre', '').strip(),
            primerApellido          = request.data.get('primerApellido', '').strip(),
            segundoApellido         = request.data.get('segundoApellido', '').strip(),
            correo                  = correo,
            telefono                = request.data.get('telefono', '').strip(),
            password                = contrasena_temporal,
            debe_cambiar_contrasena = True,
        )
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Enviar contraseña temporal por correo
    try:
        send_mail(
            subject='Bienvenido a Mestizo Mobiliario — Tu contraseña temporal',
            message=(
                f'Hola {usuario.nombre},\n\n'
                f'Tu cuenta ha sido creada exitosamente.\n\n'
                f'Tu contraseña temporal es: {contrasena_temporal}\n\n'
                f'Por seguridad, te pediremos cambiarla la próxima vez que inicies sesión.\n\n'
                f'Gracias por elegirnos.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[correo],
            fail_silently=False,
        )
    except Exception:
        # Si el correo falla, eliminamos el usuario para no dejar huérfanos
        usuario.delete()
        return Response(
            {'error': 'No se pudo enviar el correo. Verifica la dirección e intenta de nuevo.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Login automático tras registro
    token, _ = Token.objects.get_or_create(user=usuario)

    return Response({
        'token': token.key,
        'debe_cambiar_contrasena': False,  # recién registrado va directo al envío
        'user': {
            'identificacion': usuario.identificacion,
            'nombre':         usuario.nombre,
            'primerApellido': usuario.primerApellido,
            'correo':         usuario.correo,
        }
    }, status=status.HTTP_201_CREATED)


# ── Login público ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    correo     = request.data.get('correo')
    contrasena = request.data.get('contrasena')

    if not correo or not contrasena:
        return Response(
            {'error': 'Correo y contraseña son requeridos.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    usuario = authenticate(request, username=correo, password=contrasena)

    if usuario is None:
        return Response(
            {'error': 'Correo o contraseña incorrectos.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not usuario.is_active:
        return Response(
            {'error': 'Esta cuenta está desactivada.'},
            status=status.HTTP_403_FORBIDDEN
        )

    token, _ = Token.objects.get_or_create(user=usuario)

    return Response({
        'token': token.key,
        'debe_cambiar_contrasena': usuario.debe_cambiar_contrasena,
        'user': {
            'identificacion': usuario.identificacion,
            'nombre':         usuario.nombre,
            'primerApellido': usuario.primerApellido,
            'correo':         usuario.correo,
            'is_staff':       usuario.is_staff,
            'is_superuser':   usuario.is_superuser,
        }
    }, status=status.HTTP_200_OK)


# ── Cambiar contraseña temporal ───────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_contrasena_view(request):
    nueva = request.data.get('nueva_contrasena', '')
    confirmar = request.data.get('confirmar_contrasena', '')

    if not nueva or not confirmar:
        return Response(
            {'error': 'Ambos campos son requeridos.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(nueva) < 6:
        return Response(
            {'nueva_contrasena': 'La contraseña debe tener al menos 6 caracteres.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if nueva != confirmar:
        return Response(
            {'confirmar_contrasena': 'Las contraseñas no coinciden.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    usuario = request.user
    usuario.set_password(nueva)
    usuario.debe_cambiar_contrasena = False
    usuario.save()

    # Regenerar token tras cambio de contraseña
    Token.objects.filter(user=usuario).delete()
    token, _ = Token.objects.get_or_create(user=usuario)

    return Response({
        'token': token.key,
        'user': {
            'identificacion': usuario.identificacion,
            'nombre':         usuario.nombre,
            'primerApellido': usuario.primerApellido,
            'correo':         usuario.correo,
            'is_staff':       usuario.is_staff,
            'is_superuser':   usuario.is_superuser,
        },
        'mensaje': 'Contraseña actualizada correctamente.',
    }, status=status.HTTP_200_OK)


# ── Enviar código de recuperación ─────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def enviar_codigo_view(request):
    correo = request.data.get('correo', '').strip().lower()

    if not correo:
        return Response(
            {'error': 'El correo es requerido.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        usuario = Usuario.objects.get(correo=correo)
    except Usuario.DoesNotExist:
        return Response(
            {'mensaje': 'Si el correo está registrado, recibirás un código.'},
            status=status.HTTP_200_OK
        )

    codigo_obj = CodigoRecuperacion.generar(usuario)

    send_mail(
        subject='Código de recuperación — Mestizo Mobiliario',
        message=(
            f'Hola {usuario.nombre},\n\n'
            f'Tu código de recuperación es: {codigo_obj.codigo}\n\n'
            f'Este código es válido por 15 minutos.\n\n'
            f'Si no solicitaste esto, ignora este mensaje.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[correo],
        fail_silently=False,
    )

    return Response(
        {'mensaje': 'Si el correo está registrado, recibirás un código.'},
        status=status.HTTP_200_OK
    )


# ── Verificar código y cambiar contraseña ─────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def resetear_contrasena_view(request):
    correo           = request.data.get('correo', '').strip().lower()
    codigo           = request.data.get('codigo', '').strip()
    nueva_contrasena = request.data.get('nueva_contrasena', '')

    if not correo or not codigo or not nueva_contrasena:
        return Response(
            {'error': 'Correo, código y nueva contraseña son requeridos.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(nueva_contrasena) < 8:
        return Response(
            {'error': 'La contraseña debe tener al menos 8 caracteres.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        usuario = Usuario.objects.get(correo=correo)
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Código inválido o expirado.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    codigo_obj = (
        CodigoRecuperacion.objects
        .filter(usuario=usuario, codigo=codigo, usado=False)
        .order_by('-creado')
        .first()
    )

    if not codigo_obj or not codigo_obj.esta_vigente():
        return Response(
            {'error': 'Código inválido o expirado.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    usuario.set_password(nueva_contrasena)
    usuario.save()
    codigo_obj.usado = True
    codigo_obj.save()

    Token.objects.filter(user=usuario).delete()

    return Response(
        {'mensaje': 'Contraseña actualizada correctamente.'},
        status=status.HTTP_200_OK
    )