package com.flutter.tv

import com.flutter.tv.model.TurnState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class GameStateHolder {
    private val _state = MutableStateFlow(TurnState())
    val state: StateFlow<TurnState> = _state.asStateFlow()

    fun update(newState: TurnState) {
        _state.value = newState
    }
}
