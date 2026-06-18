package com.flutter.tv.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import nl.dionsegijn.konfetti.compose.KonfettiView
import nl.dionsegijn.konfetti.core.Angle
import nl.dionsegijn.konfetti.core.Party
import nl.dionsegijn.konfetti.core.Position
import nl.dionsegijn.konfetti.core.Spread
import nl.dionsegijn.konfetti.core.emitter.Emitter
import nl.dionsegijn.konfetti.core.models.Shape
import nl.dionsegijn.konfetti.core.models.Size
import java.util.concurrent.TimeUnit

@Composable
fun ParticleSparkle(modifier: Modifier = Modifier) {
    val parties = remember {
        listOf(
            Party(
                speed = 0f,
                maxSpeed = 20f,
                damping = 0.9f,
                angle = Angle.TOP,
                spread = Spread.ROUND,
                size = listOf(Size.SMALL, Size.LARGE),
                shapes = listOf(Shape.Square, Shape.Circle),
                colors = listOf(0xFFD700, 0xFFA000, 0xFFEB3B, 0x4CAF50),
                timeToLive = 2000L,
                emitter = Emitter(duration = 100, TimeUnit.MILLISECONDS).max(50),
                position = Position.Relative(0.5, 0.5)
            )
        )
    }

    KonfettiView(
        modifier = modifier.fillMaxSize(),
        parties = parties
    )
}
