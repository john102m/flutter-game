package com.flutter.tv.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import kotlin.math.*
import kotlin.random.Random

private data class Particle(
    val x: Float, val y: Float,
    val angle: Float, val speed: Float,
    val size: Float, val color: Color,
    val delay: Float
)

@Composable
fun ParticleSparkle(modifier: Modifier = Modifier) {
    val particles = remember {
        val colors = listOf(Color(0xFFFFD700), Color(0xFFFFA000), Color(0xFFFFEB3B), Color(0xFFFFFFFF))
        List(40) {
            Particle(
                x = 0.5f + Random.nextFloat() * 0.4f - 0.2f,
                y = 0.5f + Random.nextFloat() * 0.4f - 0.2f,
                angle = Random.nextFloat() * 2f * PI.toFloat(),
                speed = 0.1f + Random.nextFloat() * 0.25f,
                size = 2f + Random.nextFloat() * 4f,
                color = colors.random(),
                delay = Random.nextFloat()
            )
        }
    }

    val time by rememberInfiniteTransition(label = "sparkle").animateFloat(
        initialValue = 0f, targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1500, easing = LinearEasing)),
        label = "t"
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        particles.forEach { p ->
            val t = ((time + p.delay) % 1f)
            val alpha = 1f - t
            val dist = t * p.speed * size.minDimension
            val cx = p.x * size.width + cos(p.angle) * dist
            val cy = p.y * size.height + sin(p.angle) * dist
            drawCircle(
                color = p.color.copy(alpha = alpha * 0.8f),
                radius = p.size * (1f - t * 0.5f),
                center = Offset(cx, cy)
            )
        }
    }
}
