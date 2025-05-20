<?php
// Utilidades para integración con Stripe

// Cargar la biblioteca de Stripe
require_once '../vendor/autoload.php';

// Configurar la clave API de Stripe
function configureStripe() {
    $stripe_secret_key = STRIPE_SECRET_KEY;
    \Stripe\Stripe::setApiKey($stripe_secret_key);
}

// Procesar un pago con Stripe
function processStripePayment($token, $amount, $description) {
    try {
        // Configurar Stripe
        configureStripe();
        
        // Convertir el monto a centavos (Stripe trabaja con la moneda en su unidad más pequeña)
        $amount_cents = $amount * 100;
        
        // Crear el cargo
        $charge = \Stripe\Charge::create([
            'amount' => $amount_cents,
            'currency' => 'eur',
            'description' => $description,
            'source' => $token,
        ]);
        
        // Verificar si el cargo fue exitoso
        if ($charge->status === 'succeeded') {
            return [
                'success' => true,
                'payment_id' => $charge->id,
                'transaction_id' => $charge->balance_transaction,
                'amount' => $amount,
                'currency' => $charge->currency,
                'status' => $charge->status
            ];
        } else {
            return [
                'success' => false,
                'error' => 'El pago no fue procesado correctamente.'
            ];
        }
    } catch (\Stripe\Exception\CardException $e) {
        // Error en la tarjeta
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    } catch (\Stripe\Exception\RateLimitException $e) {
        // Demasiadas solicitudes a la API
        return [
            'success' => false,
            'error' => 'Error de límite de tasa. Inténtalo de nuevo más tarde.'
        ];
    } catch (\Stripe\Exception\InvalidRequestException $e) {
        // Parámetros inválidos
        return [
            'success' => false,
            'error' => 'Parámetros de solicitud inválidos.'
        ];
    } catch (\Stripe\Exception\AuthenticationException $e) {
        // Error de autenticación
        return [
            'success' => false,
            'error' => 'Error de autenticación con Stripe.'
        ];
    } catch (\Stripe\Exception\ApiConnectionException $e) {
        // Error de conexión con la API
        return [
            'success' => false,
            'error' => 'Error de conexión con la API de Stripe.'
        ];
    } catch (\Stripe\Exception\ApiErrorException $e) {
        // Error general de la API
        return [
            'success' => false,
            'error' => 'Error en la API de Stripe.'
        ];
    } catch (Exception $e) {
        // Otro error
        return [
            'success' => false,
            'error' => 'Error al procesar el pago: ' . $e->getMessage()
        ];
    }
}

// Crear un cliente en Stripe
function createStripeCustomer($email, $name, $token) {
    try {
        // Configurar Stripe
        configureStripe();
        
        // Crear el cliente
        $customer = \Stripe\Customer::create([
            'email' => $email,
            'name' => $name,
            'source' => $token
        ]);
        
        return [
            'success' => true,
            'customer_id' => $customer->id
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Crear un reembolso en Stripe
function createStripeRefund($charge_id, $amount = null) {
    try {
        // Configurar Stripe
        configureStripe();
        
        $refund_params = ['charge' => $charge_id];
        
        // Si se especifica un monto, añadirlo a los parámetros
        if ($amount !== null) {
            $refund_params['amount'] = $amount * 100; // Convertir a centavos
        }
        
        // Crear el reembolso
        $refund = \Stripe\Refund::create($refund_params);
        
        return [
            'success' => true,
            'refund_id' => $refund->id,
            'status' => $refund->status
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}
