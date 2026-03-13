from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils import timezone

class ManageUsuario(BaseUserManager):
    def create_user(self, identificacion, nombre, primerApellido, segundoApellido, correo, telefono, password, **krows):
        usuario = self.model(
            identificacion=identificacion,
            nombre=nombre,
            primerApellido=primerApellido,
            segundoApellido=segundoApellido,
            telefono=telefono,
            is_staff=False,
            is_superuser=False,
            is_active=True,
            date_joined=timezone.now(),
            **krows
        )
        usuario.set_password(password)
        usuario.correo = self.normalize_email(correo)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, identificacion, nombre, primerApellido, segundoApellido, correo, telefono, password, **krows):
        usuario = self.model(
            identificacion=identificacion,
            nombre=nombre,
            primerApellido=primerApellido,
            segundoApellido=segundoApellido,
            telefono=telefono,
            is_staff=True,
            is_superuser=True,
            is_active=True,
            date_joined=timezone.now(),
            **krows
        )
        usuario.set_password(password)
        usuario.correo = self.normalize_email(correo)
        usuario.save(using=self._db)
        return usuario


class Usuario(AbstractBaseUser, PermissionsMixin):
    identificacion = models.CharField(primary_key=True, max_length=12, unique=True)
    nombre = models.CharField(max_length=50)
    primerApellido = models.CharField(max_length=40)
    segundoApellido = models.CharField(max_length=40)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=10)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    groups = models.ManyToManyField(
        Group,
        related_name="usuario_users",
        blank=True,
        help_text="Los grupos a los que pertenece este usuario."
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="usuario_users_permissions",
        blank=True,
        help_text="Permisos específicos para este usuario."
    )

    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['identificacion', 'nombre', 'primerApellido', 'segundoApellido', 'telefono']
    #                   ↑ se eliminó 'direccion' porque no existe como campo en el modelo

    objects = ManageUsuario()

    def __str__(self):
        return f"{self.nombre} {self.primerApellido}"