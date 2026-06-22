import hashlib
from django.http import JsonResponse
from django.conf import settings

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Pedido
from .serializers import PedidoSerializer


class PedidoCreateView(generics.CreateAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class PedidoListView(generics.ListAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return (
                Pedido.objects
                .all()
                .order_by('-fecha')
                .select_related('usuario', 'envio')
                .prefetch_related('items__producto')
            )
        return (
            Pedido.objects
            .filter(usuario=user)
            .order_by('-fecha')
            .select_related('usuario', 'envio')
            .prefetch_related('items__producto')
        )


class PedidoDetailView(generics.RetrieveDestroyAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Pedido.objects
            .all()
            .select_related('usuario', 'envio')
            .prefetch_related('items__producto')
        )

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'No tienes permiso.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_estado_pedido(request, pk):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'No tienes permiso para realizar esta acción.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        pedido = Pedido.objects.get(pk=pk)
    except Pedido.DoesNotExist:
        return Response({'error': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get('estado')
    estados_validos = [e[0] for e in Pedido.ESTADO_CHOICES]

    if nuevo_estado not in estados_validos:
        return Response(
            {'error': f'Estado inválido. Opciones: {", ".join(estados_validos)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    pedido.estado = nuevo_estado
    pedido.save()

    return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)


def wompi_firma(request):
    reference = request.GET.get("reference")
    amount    = request.GET.get("amount")
    currency  = request.GET.get("currency", "COP")

    if not reference or not amount:
        return JsonResponse({"error": "Faltan parámetros: reference y amount son requeridos"}, status=400)

    cadena    = f"{reference}{amount}{currency}{settings.WOMPI_INTEGRITY_SECRET}"
    signature = hashlib.sha256(cadena.encode()).hexdigest()

    return JsonResponse({"signature": signature})