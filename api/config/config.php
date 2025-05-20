<?php
/**
 * Archivo principal de configuración
 * 
 * Este archivo contiene todas las configuraciones globales de la aplicación
 * y carga las variables de entorno desde el archivo .env
 * 
 * @version 2.0
 * @author Stellar Tourism Team
 */

// Cargar variables de entorno
require_once __DIR__ . '/env_loader.php';

// Configuración de la base de datos
$db_config = [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_DATABASE') ?: 'stellar_tourism',
    'username' => getenv('DB_USERNAME') ?: 'root',
    'password' => getenv('DB_PASSWORD') ?: '',
    'charset' => getenv('DB_CHARSET') ?: 'utf8mb4',
    'collation' => getenv('DB_COLLATION') ?: 'utf8mb4_unicode_ci',
    'prefix' => getenv('DB_PREFIX') ?: '',
    'timezone' => getenv('DB_TIMEZONE') ?: '+00:00',
    'persistent' => getenv('DB_PERSISTENT') === 'true',
    'debug' => getenv('DB_DEBUG') === 'true'
];

// Configuración de la aplicación
$app_config = [
    'name' => getenv('APP_NAME') ?: 'Stellar Tourism',
    'env' => getenv('APP_ENV') ?: 'production',
    'debug' => getenv('APP_DEBUG') === 'true',
    'url' => getenv('APP_URL') ?: 'http://localhost',
    'timezone' => getenv('APP_TIMEZONE') ?: 'UTC',
    'locale' => getenv('APP_LOCALE') ?: 'es',
    'key' => getenv('APP_KEY') ?: '',
    'cipher' => getenv('APP_CIPHER') ?: 'AES-256-CBC',
    'log_level' => getenv('APP_LOG_LEVEL') ?: 'warning',
    'log_max_files' => getenv('APP_LOG_MAX_FILES') ?: 30,
    'log_path' => getenv('APP_LOG_PATH') ?: __DIR__ . '/../../logs',
    'cache_path' => getenv('APP_CACHE_PATH') ?: __DIR__ . '/../../cache',
    'upload_path' => getenv('APP_UPLOAD_PATH') ?: __DIR__ . '/../../uploads',
    'api_version' => getenv('API_VERSION') ?: 'v1',
    'api_prefix' => getenv('API_PREFIX') ?: 'api',
    'api_domain' => getenv('API_DOMAIN') ?: '',
    'api_debug' => getenv('API_DEBUG') === 'true',
    'api_strict' => getenv('API_STRICT') === 'true',
    'api_throttle' => getenv('API_THROTTLE') ?: '60,1'
];

// Configuración de seguridad
$security_config = [
    'jwt_secret' => getenv('JWT_SECRET') ?: 'your-secret-key',
    'jwt_ttl' => getenv('JWT_TTL') ?: 60, // minutos
    'jwt_refresh_ttl' => getenv('JWT_REFRESH_TTL') ?: 20160, // minutos (14 días)
    'jwt_blacklist_grace_period' => getenv('JWT_BLACKLIST_GRACE_PERIOD') ?: 30, // segundos
    'cors_allowed_origins' => explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: '*'),
    'cors_allowed_methods' => explode(',', getenv('CORS_ALLOWED_METHODS') ?: 'GET,POST,PUT,DELETE,OPTIONS'),
    'cors_allowed_headers' => explode(',', getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type,Authorization,X-Requested-With'),
    'cors_exposed_headers' => explode(',', getenv('CORS_EXPOSED_HEADERS') ?: ''),
    'cors_max_age' => getenv('CORS_MAX_AGE') ?: 0,
    'cors_supports_credentials' => getenv('CORS_SUPPORTS_CREDENTIALS') === 'true',
    'rate_limit_enabled' => getenv('RATE_LIMIT_ENABLED') === 'true',
    'rate_limit_attempts' => getenv('RATE_LIMIT_ATTEMPTS') ?: 60,
    'rate_limit_time' => getenv('RATE_LIMIT_TIME') ?: 1, // minutos
    'password_min_length' => getenv('PASSWORD_MIN_LENGTH') ?: 8,
    'password_require_special' => getenv('PASSWORD_REQUIRE_SPECIAL') === 'true',
    'password_require_number' => getenv('PASSWORD_REQUIRE_NUMBER') === 'true',
    'password_require_uppercase' => getenv('PASSWORD_REQUIRE_UPPERCASE') === 'true',
    'password_require_lowercase' => getenv('PASSWORD_REQUIRE_LOWERCASE') === 'true'
];

// Configuración de servicios externos
$services_config = [
    // Stripe
    'stripe_key' => getenv('STRIPE_KEY') ?: '',
    'stripe_secret' => getenv('STRIPE_SECRET') ?: '',
    'stripe_webhook_secret' => getenv('STRIPE_WEBHOOK_SECRET') ?: '',
    'stripe_currency' => getenv('STRIPE_CURRENCY') ?: 'usd',
    
    // PayPal
    'paypal_client_id' => getenv('PAYPAL_CLIENT_ID') ?: '',
    'paypal_secret' => getenv('PAYPAL_SECRET') ?: '',
    'paypal_mode' => getenv('PAYPAL_MODE') ?: 'sandbox', // sandbox o live
    'paypal_currency' => getenv('PAYPAL_CURRENCY') ?: 'USD',
    
    // Correo electrónico
    'mail_driver' => getenv('MAIL_DRIVER') ?: 'smtp',
    'mail_host' => getenv('MAIL_HOST') ?: 'smtp.mailtrap.io',
    'mail_port' => getenv('MAIL_PORT') ?: '2525',
    'mail_username' => getenv('MAIL_USERNAME') ?: '',
    'mail_password' => getenv('MAIL_PASSWORD') ?: '',
    'mail_encryption' => getenv('MAIL_ENCRYPTION') ?: 'tls',
    'mail_from_address' => getenv('MAIL_FROM_ADDRESS') ?: 'hello@example.com',
    'mail_from_name' => getenv('MAIL_FROM_NAME') ?: 'Stellar Tourism',
    
    // Firebase
    'firebase_api_key' => getenv('FIREBASE_API_KEY') ?: '',
    'firebase_auth_domain' => getenv('FIREBASE_AUTH_DOMAIN') ?: '',
    'firebase_database_url' => getenv('FIREBASE_DATABASE_URL') ?: '',
    'firebase_project_id' => getenv('FIREBASE_PROJECT_ID') ?: '',
    'firebase_storage_bucket' => getenv('FIREBASE_STORAGE_BUCKET') ?: '',
    'firebase_messaging_sender_id' => getenv('FIREBASE_MESSAGING_SENDER_ID') ?: '',
    'firebase_app_id' => getenv('FIREBASE_APP_ID') ?: '',
    'firebase_measurement_id' => getenv('FIREBASE_MEASUREMENT_ID') ?: '',
    
    // AWS S3
    's3_key' => getenv('S3_KEY') ?: '',
    's3_secret' => getenv('S3_SECRET') ?: '',
    's3_region' => getenv('S3_REGION') ?: 'us-east-1',
    's3_bucket' => getenv('S3_BUCKET') ?: '',
    's3_url' => getenv('S3_URL') ?: '',
    's3_endpoint' => getenv('S3_ENDPOINT') ?: '',
    
    // Google Maps
    'google_maps_key' => getenv('GOOGLE_MAPS_KEY') ?: '',
    
    // reCAPTCHA
    'recaptcha_site_key' => getenv('RECAPTCHA_SITE_KEY') ?: '',
    'recaptcha_secret_key' => getenv('RECAPTCHA_SECRET_KEY') ?: '',
    'recaptcha_version' => getenv('RECAPTCHA_VERSION') ?: 'v2',
];

// Configuración de características (feature flags)
$features_config = [
    'enable_registration' => getenv('FEATURE_ENABLE_REGISTRATION') !== 'false',
    'enable_social_login' => getenv('FEATURE_ENABLE_SOCIAL_LOGIN') === 'true',
    'enable_email_verification' => getenv('FEATURE_ENABLE_EMAIL_VERIFICATION') === 'true',
    'enable_password_reset' => getenv('FEATURE_ENABLE_PASSWORD_RESET') !== 'false',
    'enable_two_factor_auth' => getenv('FEATURE_ENABLE_TWO_FACTOR_AUTH') === 'true',
    'enable_api_documentation' => getenv('FEATURE_ENABLE_API_DOCUMENTATION') === 'true',
    'enable_maintenance_mode' => getenv('FEATURE_ENABLE_MAINTENANCE_MODE') === 'true',
    'enable_activity_log' => getenv('FEATURE_ENABLE_ACTIVITY_LOG') === 'true',
    'enable_user_impersonation' => getenv('FEATURE_ENABLE_USER_IMPERSONATION') === 'true',
    'enable_webhooks' => getenv('FEATURE_ENABLE_WEBHOOKS') === 'true',
    'enable_notifications' => getenv('FEATURE_ENABLE_NOTIFICATIONS') !== 'false',
    'enable_real_time_notifications' => getenv('FEATURE_ENABLE_REAL_TIME_NOTIFICATIONS') === 'true',
    'enable_cache' => getenv('FEATURE_ENABLE_CACHE') !== 'false',
    'enable_rate_limiting' => getenv('FEATURE_ENABLE_RATE_LIMITING') !== 'false',
    'enable_analytics' => getenv('FEATURE_ENABLE_ANALYTICS') === 'true',
    'enable_dark_mode' => getenv('FEATURE_ENABLE_DARK_MODE') !== 'false',
    'enable_multi_language' => getenv('FEATURE_ENABLE_MULTI_LANGUAGE') === 'true',
    'enable_gdpr_compliance' => getenv('FEATURE_ENABLE_GDPR_COMPLIANCE') === 'true',
    'enable_backup' => getenv('FEATURE_ENABLE_BACKUP') === 'true',
    'enable_api_versioning' => getenv('FEATURE_ENABLE_API_VERSIONING') === 'true',
    'enable_progressive_web_app' => getenv('FEATURE_ENABLE_PROGRESSIVE_WEB_APP') === 'true',
    'enable_offline_mode' => getenv('FEATURE_ENABLE_OFFLINE_MODE') === 'true',
    'enable_3d_models' => getenv('FEATURE_ENABLE_3D_MODELS') === 'true',
    'enable_virtual_reality' => getenv('FEATURE_ENABLE_VIRTUAL_REALITY') === 'true',
    'enable_augmented_reality' => getenv('FEATURE_ENABLE_AUGMENTED_REALITY') === 'true',
    'enable_voice_commands' => getenv('FEATURE_ENABLE_VOICE_COMMANDS') === 'true',
    'enable_chat_bot' => getenv('FEATURE_ENABLE_CHAT_BOT') === 'true',
    'enable_recommendations' => getenv('FEATURE_ENABLE_RECOMMENDATIONS') === 'true',
    'enable_reviews' => getenv('FEATURE_ENABLE_REVIEWS') !== 'false',
    'enable_favorites' => getenv('FEATURE_ENABLE_FAVORITES') !== 'false',
    'enable_sharing' => getenv('FEATURE_ENABLE_SHARING') !== 'false',
    'enable_export' => getenv('FEATURE_ENABLE_EXPORT') === 'true',
    'enable_print' => getenv('FEATURE_ENABLE_PRINT') === 'true',
    'enable_accessibility' => getenv('FEATURE_ENABLE_ACCESSIBILITY') !== 'false',
    'enable_high_contrast' => getenv('FEATURE_ENABLE_HIGH_CONTRAST') === 'true',
    'enable_text_to_speech' => getenv('FEATURE_ENABLE_TEXT_TO_SPEECH') === 'true',
    'enable_speech_to_text' => getenv('FEATURE_ENABLE_SPEECH_TO_TEXT') === 'true',
    'enable_keyboard_shortcuts' => getenv('FEATURE_ENABLE_KEYBOARD_SHORTCUTS') !== 'false',
    'enable_screen_reader' => getenv('FEATURE_ENABLE_SCREEN_READER') !== 'false',
    'enable_reduced_motion' => getenv('FEATURE_ENABLE_REDUCED_MOTION') === 'true',
    'enable_large_text' => getenv('FEATURE_ENABLE_LARGE_TEXT') === 'true',
    'enable_high_visibility_focus' => getenv('FEATURE_ENABLE_HIGH_VISIBILITY_FOCUS') !== 'false',
    'enable_color_blind_mode' => getenv('FEATURE_ENABLE_COLOR_BLIND_MODE') === 'true',
    'enable_dyslexia_font' => getenv('FEATURE_ENABLE_DYSLEXIA_FONT') === 'true',
    'enable_image_descriptions' => getenv('FEATURE_ENABLE_IMAGE_DESCRIPTIONS') !== 'false',
    'enable_video_captions' => getenv('FEATURE_ENABLE_VIDEO_CAPTIONS') !== 'false',
    'enable_audio_descriptions' => getenv('FEATURE_ENABLE_AUDIO_DESCRIPTIONS') === 'true',
    'enable_skip_to_content' => getenv('FEATURE_ENABLE_SKIP_TO_CONTENT') !== 'false',
    'enable_focus_trap' => getenv('FEATURE_ENABLE_FOCUS_TRAP') !== 'false',
    'enable_aria_live_regions' => getenv('FEATURE_ENABLE_ARIA_LIVE_REGIONS') !== 'false',
    'enable_focus_visible' => getenv('FEATURE_ENABLE_FOCUS_VISIBLE') !== 'false',
    'enable_focus_order' => getenv('FEATURE_ENABLE_FOCUS_ORDER') !== 'false',
    'enable_focus_management' => getenv('FEATURE_ENABLE_FOCUS_MANAGEMENT') !== 'false',
    'enable_keyboard_navigation' => getenv('FEATURE_ENABLE_KEYBOARD_NAVIGATION') !== 'false',
    'enable_touch_target_size' => getenv('FEATURE_ENABLE_TOUCH_TARGET_SIZE') !== 'false',
    'enable_contrast_checker' => getenv('FEATURE_ENABLE_CONTRAST_CHECKER') === 'true',
    'enable_accessibility_statement' => getenv('FEATURE_ENABLE_ACCESSIBILITY_STATEMENT') !== 'false',
    'enable_accessibility_preferences' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PREFERENCES') !== 'false',
    'enable_accessibility_help' => getenv('FEATURE_ENABLE_ACCESSIBILITY_HELP') !== 'false',
    'enable_accessibility_feedback' => getenv('FEATURE_ENABLE_ACCESSIBILITY_FEEDBACK') === 'true',
    'enable_accessibility_testing' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TESTING') === 'true',
    'enable_accessibility_monitoring' => getenv('FEATURE_ENABLE_ACCESSIBILITY_MONITORING') === 'true',
    'enable_accessibility_reporting' => getenv('FEATURE_ENABLE_ACCESSIBILITY_REPORTING') === 'true',
    'enable_accessibility_training' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TRAINING') === 'true',
    'enable_accessibility_audit' => getenv('FEATURE_ENABLE_ACCESSIBILITY_AUDIT') === 'true',
    'enable_accessibility_certification' => getenv('FEATURE_ENABLE_ACCESSIBILITY_CERTIFICATION') === 'true',
    'enable_accessibility_compliance' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COMPLIANCE') === 'true',
    'enable_accessibility_policy' => getenv('FEATURE_ENABLE_ACCESSIBILITY_POLICY') === 'true',
    'enable_accessibility_guidelines' => getenv('FEATURE_ENABLE_ACCESSIBILITY_GUIDELINES') === 'true',
    'enable_accessibility_standards' => getenv('FEATURE_ENABLE_ACCESSIBILITY_STANDARDS') === 'true',
    'enable_accessibility_best_practices' => getenv('FEATURE_ENABLE_ACCESSIBILITY_BEST_PRACTICES') === 'true',
    'enable_accessibility_resources' => getenv('FEATURE_ENABLE_ACCESSIBILITY_RESOURCES') === 'true',
    'enable_accessibility_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TOOLS') === 'true',
    'enable_accessibility_plugins' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PLUGINS') === 'true',
    'enable_accessibility_widgets' => getenv('FEATURE_ENABLE_ACCESSIBILITY_WIDGETS') === 'true',
    'enable_accessibility_components' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COMPONENTS') === 'true',
    'enable_accessibility_patterns' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PATTERNS') === 'true',
    'enable_accessibility_templates' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TEMPLATES') === 'true',
    'enable_accessibility_examples' => getenv('FEATURE_ENABLE_ACCESSIBILITY_EXAMPLES') === 'true',
    'enable_accessibility_demos' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DEMOS') === 'true',
    'enable_accessibility_tutorials' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TUTORIALS') === 'true',
    'enable_accessibility_documentation' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DOCUMENTATION') === 'true',
    'enable_accessibility_faq' => getenv('FEATURE_ENABLE_ACCESSIBILITY_FAQ') === 'true',
    'enable_accessibility_support' => getenv('FEATURE_ENABLE_ACCESSIBILITY_SUPPORT') === 'true',
    'enable_accessibility_community' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COMMUNITY') === 'true',
    'enable_accessibility_forum' => getenv('FEATURE_ENABLE_ACCESSIBILITY_FORUM') === 'true',
    'enable_accessibility_blog' => getenv('FEATURE_ENABLE_ACCESSIBILITY_BLOG') === 'true',
    'enable_accessibility_newsletter' => getenv('FEATURE_ENABLE_ACCESSIBILITY_NEWSLETTER') === 'true',
    'enable_accessibility_events' => getenv('FEATURE_ENABLE_ACCESSIBILITY_EVENTS') === 'true',
    'enable_accessibility_webinars' => getenv('FEATURE_ENABLE_ACCESSIBILITY_WEBINARS') === 'true',
    'enable_accessibility_podcasts' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PODCASTS') === 'true',
    'enable_accessibility_videos' => getenv('FEATURE_ENABLE_ACCESSIBILITY_VIDEOS') === 'true',
    'enable_accessibility_courses' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COURSES') === 'true',
    'enable_accessibility_certifications' => getenv('FEATURE_ENABLE_ACCESSIBILITY_CERTIFICATIONS') === 'true',
    'enable_accessibility_jobs' => getenv('FEATURE_ENABLE_ACCESSIBILITY_JOBS') === 'true',
    'enable_accessibility_careers' => getenv('FEATURE_ENABLE_ACCESSIBILITY_CAREERS') === 'true',
    'enable_accessibility_internships' => getenv('FEATURE_ENABLE_ACCESSIBILITY_INTERNSHIPS') === 'true',
    'enable_accessibility_volunteering' => getenv('FEATURE_ENABLE_ACCESSIBILITY_VOLUNTEERING') === 'true',
    'enable_accessibility_mentoring' => getenv('FEATURE_ENABLE_ACCESSIBILITY_MENTORING') === 'true',
    'enable_accessibility_coaching' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COACHING') === 'true',
    'enable_accessibility_consulting' => getenv('FEATURE_ENABLE_ACCESSIBILITY_CONSULTING') === 'true',
    'enable_accessibility_services' => getenv('FEATURE_ENABLE_ACCESSIBILITY_SERVICES') === 'true',
    'enable_accessibility_products' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PRODUCTS') === 'true',
    'enable_accessibility_solutions' => getenv('FEATURE_ENABLE_ACCESSIBILITY_SOLUTIONS') === 'true',
    'enable_accessibility_innovations' => getenv('FEATURE_ENABLE_ACCESSIBILITY_INNOVATIONS') === 'true',
    'enable_accessibility_research' => getenv('FEATURE_ENABLE_ACCESSIBILITY_RESEARCH') === 'true',
    'enable_accessibility_development' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DEVELOPMENT') === 'true',
    'enable_accessibility_design' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DESIGN') === 'true',
    'enable_accessibility_testing_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TESTING_TOOLS') === 'true',
    'enable_accessibility_monitoring_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_MONITORING_TOOLS') === 'true',
    'enable_accessibility_reporting_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_REPORTING_TOOLS') === 'true',
    'enable_accessibility_audit_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_AUDIT_TOOLS') === 'true',
    'enable_accessibility_compliance_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COMPLIANCE_TOOLS') === 'true',
    'enable_accessibility_policy_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_POLICY_TOOLS') === 'true',
    'enable_accessibility_guidelines_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_GUIDELINES_TOOLS') === 'true',
    'enable_accessibility_standards_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_STANDARDS_TOOLS') === 'true',
    'enable_accessibility_best_practices_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_BEST_PRACTICES_TOOLS') === 'true',
    'enable_accessibility_resources_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_RESOURCES_TOOLS') === 'true',
    'enable_accessibility_tools_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TOOLS_TOOLS') === 'true',
    'enable_accessibility_plugins_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PLUGINS_TOOLS') === 'true',
    'enable_accessibility_widgets_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_WIDGETS_TOOLS') === 'true',
    'enable_accessibility_components_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COMPONENTS_TOOLS') === 'true',
    'enable_accessibility_patterns_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PATTERNS_TOOLS') === 'true',
    'enable_accessibility_templates_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TEMPLATES_TOOLS') === 'true',
    'enable_accessibility_examples_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_EXAMPLES_TOOLS') === 'true',
    'enable_accessibility_demos_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DEMOS_TOOLS') === 'true',
    'enable_accessibility_tutorials_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_TUTORIALS_TOOLS') === 'true',
    'enable_accessibility_documentation_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DOCUMENTATION_TOOLS') === 'true',
    'enable_accessibility_faq_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_FAQ_TOOLS') === 'true',
    'enable_accessibility_support_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_SUPPORT_TOOLS') === 'true',
    'enable_accessibility_community_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COMMUNITY_TOOLS') === 'true',
    'enable_accessibility_forum_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_FORUM_TOOLS') === 'true',
    'enable_accessibility_blog_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_BLOG_TOOLS') === 'true',
    'enable_accessibility_newsletter_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_NEWSLETTER_TOOLS') === 'true',
    'enable_accessibility_events_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_EVENTS_TOOLS') === 'true',
    'enable_accessibility_webinars_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_WEBINARS_TOOLS') === 'true',
    'enable_accessibility_podcasts_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PODCASTS_TOOLS') === 'true',
    'enable_accessibility_videos_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_VIDEOS_TOOLS') === 'true',
    'enable_accessibility_courses_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COURSES_TOOLS') === 'true',
    'enable_accessibility_certifications_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_CERTIFICATIONS_TOOLS') === 'true',
    'enable_accessibility_jobs_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_JOBS_TOOLS') === 'true',
    'enable_accessibility_careers_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_CAREERS_TOOLS') === 'true',
    'enable_accessibility_internships_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_INTERNSHIPS_TOOLS') === 'true',
    'enable_accessibility_volunteering_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_VOLUNTEERING_TOOLS') === 'true',
    'enable_accessibility_mentoring_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_MENTORING_TOOLS') === 'true',
    'enable_accessibility_coaching_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_COACHING_TOOLS') === 'true',
    'enable_accessibility_consulting_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_CONSULTING_TOOLS') === 'true',
    'enable_accessibility_services_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_SERVICES_TOOLS') === 'true',
    'enable_accessibility_products_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_PRODUCTS_TOOLS') === 'true',
    'enable_accessibility_solutions_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_SOLUTIONS_TOOLS') === 'true',
    'enable_accessibility_innovations_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_INNOVATIONS_TOOLS') === 'true',
    'enable_accessibility_research_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_RESEARCH_TOOLS') === 'true',
    'enable_accessibility_development_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DEVELOPMENT_TOOLS') === 'true',
    'enable_accessibility_design_tools' => getenv('FEATURE_ENABLE_ACCESSIBILITY_DESIGN_TOOLS') === 'true',
];

// Exportar configuraciones
return [
    'db' => $db_config,
    'app' => $app_config,
    'security' => $security_config,
    'services' => $services_config,
    'features' => $features_config
];
