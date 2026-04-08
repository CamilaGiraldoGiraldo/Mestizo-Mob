import os
import ssl
from pathlib import Path
import cloudinary

# ==========================
# PATHS
# ==========================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================
# SECURITY
# ==========================
SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-default-key")
DEBUG = os.environ.get("DEBUG", "False") == "True"
ALLOWED_HOSTS = ['*']

# ==========================
# APPLICATIONS
# ==========================
BASE_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

LOCAL_APPS = [
    'apps.productos',
    'apps.imagenProducto',
    'apps.pedido',
    'apps.envio',
    'apps.usuario',
    'apps.categorias',
    'apps.colores',
    'apps.citas',
]

THIRD_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
    'nested_admin',
]

INSTALLED_APPS = BASE_APPS + LOCAL_APPS + THIRD_APPS

# ==========================
# MIDDLEWARE
# ==========================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==========================
# CORS
# ==========================
CORS_ALLOW_ALL_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")

# ==========================
# TEMPLATES
# ==========================
ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ==========================
# DATABASE
# ==========================
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.mysql'),
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}

# ==========================
# CLOUDINARY
# ==========================
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_NAME"),
    api_key=os.environ.get("CLOUDINARY_KEY"),
    api_secret=os.environ.get("CLOUDINARY_SECRET"),
    secure=True
)
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# ==========================
# AUTH
# ==========================
AUTH_USER_MODEL = 'usuario.Usuario'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ==========================
# INTERNATIONALIZATION
# ==========================
LANGUAGE_CODE = 'es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ==========================
# STATIC & MEDIA
# ==========================
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

# ==========================
# EMAIL
# ==========================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 465))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "False") == "True"
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", "True") == "True"
EMAIL_HOST_USER = os.environ.get("EMAIL_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_PASSWORD")
DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL", f"{EMAIL_HOST_USER}"
)
EMAIL_SSL_CONTEXT = ssl.create_default_context()
EMAIL_SSL_CONTEXT.check_hostname = False
EMAIL_SSL_CONTEXT.verify_mode = ssl.CERT_NONE

# ==========================
# REST FRAMEWORK
# ==========================
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend'
    ],
    'DEFAULT_PAGINATION_CLASS':
        'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# ==========================
# DEFAULT PRIMARY KEY
# ==========================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'