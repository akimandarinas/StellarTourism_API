<?php

// Enviar correo electrónico
function sendEmail($to, $subject, $message, $from = null) {
    $from = $from ?: getenv('EMAIL_FROM') ?: 'noreply@stellartourism.com';
    $headers = "From: $from\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    return mail($to, $subject, $message, $headers);
}

// Enviar notificación de reserva
function sendBookingNotification($user_email, $user_name, $booking_data) {
    $subject = "Confirmación de Reserva - StellarTourism";

    $message = "
    <html>
    <head>
        <title>Confirmación de Reserva</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 10px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .booking-details { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #0066cc; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>StellarTourism</h1>
            </div>
            <div class='content'>
                <h2>¡Hola, {$user_name}!</h2>
                <p>Tu reserva ha sido confirmada. A continuación, encontrarás los detalles:</p>
                
                <div class='booking-details'>
                    <p><strong>Destino:</strong> {$booking_data['destino']}</p>
                    <p><strong>Nave:</strong> {$booking_data['nave']}</p>
                    <p><strong>Fecha de Despegue:</strong> {$booking_data['fecha_despegue']}</p>
                    <p><strong>Fecha de Retorno:</strong> {$booking_data['fecha_retorno']}</p>
                    <p><strong>Pasajeros:</strong> {$booking_data['pasajeros']}</p>
                    <p><strong>Precio Total:</strong> €{$booking_data['precio']}</p>
                </div>
                
                <p>Puedes ver los detalles completos de tu reserva en tu cuenta.</p>
                <p>¡Gracias por elegir StellarTourism para tu aventura espacial!</p>
            </div>
            <div class='footer'>
                <p>© " . date('Y') . " StellarTourism. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    return sendEmail($user_email, $subject, $message);
}

// Enviar notificación de pago
function sendPaymentNotification($user_email, $user_name, $payment_data) {
    $subject = "Confirmación de Pago - StellarTourism";
    
    $message = "
    <html>
    <head>
        <title>Confirmación de Pago</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 10px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .payment-details { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #00cc66; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>StellarTourism</h1>
            </div>
            <div class='content'>
                <h2>¡Hola, {$user_name}!</h2>
                <p>Hemos recibido tu pago correctamente. A continuación, encontrarás los detalles:</p>
                
                <div class='payment-details'>
                    <p><strong>ID de Transacción:</strong> {$payment_data['transaction_id']}</p>
                    <p><strong>Cantidad:</strong> €{$payment_data['amount']}</p>
                    <p><strong>Método de Pago:</strong> {$payment_data['method']}</p>
                    <p><strong>Fecha:</strong> {$payment_data['date']}</p>
                    <p><strong>Estado:</strong> {$payment_data['status']}</p>
                </div>
                
                <p>Puedes ver los detalles completos de tu pago en tu cuenta.</p>
                <p>¡Gracias por elegir StellarTourism para tu aventura espacial!</p>
            </div>
            <div class='footer'>
                <p>© " . date('Y') . " StellarTourism. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    return sendEmail($user_email, $subject, $message);
}

// Enviar notificación de cancelación
function sendCancellationNotification($user_email, $user_name, $booking_data) {
    $subject = "Cancelación de Reserva - StellarTourism";
    
    $message = "
    <html>
    <head>
        <title>Cancelación de Reserva</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 10px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .booking-details { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #cc0000; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>StellarTourism</h1>
            </div>
            <div class='content'>
                <h2>¡Hola, {$user_name}!</h2>
                <p>Tu reserva ha sido cancelada. A continuación, encontrarás los detalles:</p>
                
                <div class='booking-details'>
                    <p><strong>Destino:</strong> {$booking_data['destino']}</p>
                    <p><strong>Nave:</strong> {$booking_data['nave']}</p>
                    <p><strong>Fecha de Despegue:</strong> {$booking_data['fecha_despegue']}</p>
                    <p><strong>Fecha de Retorno:</strong> {$booking_data['fecha_retorno']}</p>
                </div>
                
                <p>Si has solicitado un reembolso, procesaremos tu solicitud en los próximos días hábiles.</p>
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
            <div class='footer'>
                <p>© " . date('Y') . " StellarTourism. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    return sendEmail($user_email, $subject, $message);
}
