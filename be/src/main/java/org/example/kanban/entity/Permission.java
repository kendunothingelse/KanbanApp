package org.example.kanban.entity;

public enum Permission {
    BOARD_MANAGE,   // admin đổi / xóa member
    BOARD_INVITE,   // admin + member được mời thêm member
    COLUMN_EDIT,
    CARD_EDIT,
    CARD_VIEW
}