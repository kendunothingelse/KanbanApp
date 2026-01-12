import React from "react";
import EventIcon from "@mui/icons-material/Event";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { palette, healthColors } from "../theme/colors";

export interface StatusInfo {
    label:  string;
    color: string;
    icon: React.ReactNode;
    subtitle:  string;
}

/**
 * Tính trạng thái deadline dự án dựa trên endDate của Board
 */
export function getProjectDeadlineStatus(endDate?: string | null): StatusInfo {
    if (!endDate) {
        return {
            label: "CHƯA ĐẶT DEADLINE",
            color: palette.text.secondary,
            icon:  React.createElement(EventIcon),
            subtitle: "Hãy đặt deadline cho dự án",
        };
    }

    const deadline = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const days = Math.floor((deadline. getTime() - today.getTime()) / 86400000);

    if (days < 0) {
        return {
            label: "ĐÃ QUÁ DEADLINE",
            color: healthColors. DELAYED,
            icon:  React.createElement(WarningIcon),
            subtitle: `Quá hạn ${Math.abs(days)} ngày (deadline: ${endDate})`,
        };
    }
    if (days <= 3) {
        return {
            label:  "SẮP ĐẾN DEADLINE",
            color: healthColors.AT_RISK,
            icon: React. createElement(WarningIcon),
            subtitle: `Còn ${days} ngày (deadline: ${endDate})`,
        };
    }
    return {
        label:  "ĐANG TRONG THỜI GIAN",
        color: healthColors.ON_TRACK,
        icon: React. createElement(CheckCircleIcon),
        subtitle: `Còn ${days} ngày (deadline: ${endDate})`,
    };
}

/**
 * Tính trạng thái task dựa trên tiến độ thực tế
 * Logic: So sánh % hoàn thành với % thời gian đã trôi qua
 */
export function getTaskProgressStatus(
    totalTasks: number,
    doneTasks: number,
    boardCreatedAt?:  string,
    boardEndDate?: string | null
): StatusInfo {
    // Không có task
    if (totalTasks === 0) {
        return {
            label: "CHƯA CÓ TASK",
            color:  palette.text.secondary,
            icon:  React.createElement(HourglassEmptyIcon),
            subtitle: "Tạo task để bắt đầu theo dõi",
        };
    }

    const completionPercent = Math.round((doneTasks / totalTasks) * 100);

    // Đã hoàn thành 100%
    if (doneTasks === totalTasks) {
        return {
            label: "HOÀN THÀNH",
            color: healthColors.ON_TRACK,
            icon: React. createElement(CheckCircleIcon),
            subtitle: `${doneTasks}/${totalTasks} tasks (100%)`,
        };
    }

    // Nếu không có deadline hoặc ngày tạo, chỉ hiển thị tiến độ
    if (!boardEndDate || ! boardCreatedAt) {
        return {
            label: "ĐANG TIẾN HÀNH",
            color:  palette.primary.main,
            icon: React.createElement(HourglassEmptyIcon),
            subtitle:  `${doneTasks}/${totalTasks} tasks (${completionPercent}%)`,
        };
    }

    // Tính % thời gian đã trôi qua
    const startDate = new Date(boardCreatedAt);
    const endDate = new Date(boardEndDate);
    const today = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();

    // Nếu đã qua deadline
    if (elapsedDuration >= totalDuration) {
        return {
            label: "CHẬM TIẾN ĐỘ",
            color: healthColors. DELAYED,
            icon: React.createElement(WarningIcon),
            subtitle: `${doneTasks}/${totalTasks} tasks (${completionPercent}%) - Cần hoàn thành gấp`,
        };
    }

    const timePercent = Math.round((elapsedDuration / totalDuration) * 100);
    const progressDiff = completionPercent - timePercent;

    // So sánh tiến độ với thời gian
    if (progressDiff >= 0) {
        // Đang đúng hoặc vượt tiến độ
        return {
            label: "ĐÚNG TIẾN ĐỘ",
            color: healthColors. ON_TRACK,
            icon: React.createElement(CheckCircleIcon),
            subtitle: `${doneTasks}/${totalTasks} tasks (${completionPercent}%) - Thời gian:  ${timePercent}%`,
        };
    } else if (progressDiff >= -15) {
        // Chậm nhẹ (trong khoảng 15%)
        return {
            label: "NGUY CƠ TRỄ",
            color: healthColors.AT_RISK,
            icon: React. createElement(WarningIcon),
            subtitle: `${doneTasks}/${totalTasks} tasks (${completionPercent}%) - Thời gian: ${timePercent}%`,
        };
    } else {
        // Chậm nhiều
        return {
            label: "CHẬM TIẾN ĐỘ",
            color: healthColors. DELAYED,
            icon: React.createElement(WarningIcon),
            subtitle:  `${doneTasks}/${totalTasks} tasks (${completionPercent}%) - Thời gian: ${timePercent}%`,
        };
    }
}