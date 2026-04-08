from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.http import JsonResponse
import hashlib

from .models import Pedido
from .serializers import PedidoSerializer


# 🔐 KEY DE PRUEBA WOMPI
INTEGRITY_KEY = "test_integrity_key"


# -------------------------
# CRUD PEDIDOS (igual que tenías)
# -------------------------

class PedidoCreateView(generics.CreateAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        pedido = serializer.save(usuario=self.request.user)

        # 🔥 Generar referencia automáticamente
        pedido.referencia_pago = f"pedido_{pedido.id}"
        pedido.save()


class PedidoListView(generics.ListAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Pedido.objects.all().order_by('-fecha').select_related('usuario', 'envio').prefetch_related('items__producto')
        return Pedido.objects.filter(usuario=user).order_by('-fecha').select_related('usuario', 'envio').prefetch_related('items__producto')


class PedidoDetailView(generics.RetrieveDestroyAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pedido.objects.all().select_related('usuario', 'envio').prefetch_related('items__producto')

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'No tienes permiso.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_estado_pedido(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'No tienes permiso para realizar esta acción.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        pedido = Pedido.objects.get(pk=pk)
    except Pedido.DoesNotExist:
        return Response({'error': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get('estado')
    estados_validos = [e[0] for e in Pedido.ESTADO_CHOICES]

    if nuevo_estado not in estados_validos:
        return Response(
            {'error': f'Estado inválido. Opciones: {", ".join(estados_validos)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    pedido.estado = nuevo_estado
    pedido.save()

    return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)


# -------------------------
# 💳 WOMPI - GENERAR FIRMA
# -------------------------

@api_view(['GET'])
def generar_firma_wompi(request):
    reference = request.GET.get("reference")
    amount = request.GET.get("amount")
    currency = request.GET.get("currency")

    if not reference or not amount or not currency:
        return Response({"error": "Datos incompletos"}, status=400)

    texto = f"{reference}{amount}{currency}{INTEGRITY_KEY}"
    firma = hashlib.sha256(texto.encode()).hexdigest()

    return Response({"signature": firma})


# -------------------------
# 🔥 (OPCIONAL) SIMULAR CONFIRMACIÓN DE PAGO
# -------------------------

@api_view(['POST'])
def confirmar_pago(request):
    reference = request.data.get("reference")

    try:
        pedido = Pedido.objects.get(referencia_pago=reference)
    except Pedido.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=404)

    pedido.estado_pago = "pagado"
    pedido.estado = "confirmado"
    pedido.save()

    return Response({"mensaje": "Pago confirmado"})