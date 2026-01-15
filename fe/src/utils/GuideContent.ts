export const workspaceGuide = {
    createEdit: [
        "1. Bấm nút 'Tạo Khu vực làm việc' ở góc trên bên phải.",
        "2. Nhập tên phòng ban hoặc nhóm (VD: 'Phòng Marketing').",
        "3. Sau khi tạo, bấm 'Tạo Dự án' để thêm bảng công việc con bên trong.",
        "Lưu ý: Chỉ người tạo ra Workspace mới có quyền xóa nó."
    ],
    members: [
        "Để mời người khác vào làm việc, bạn phải vào cụ thể một 'Dự án' (Board).",
        "Workspace chỉ là lớp vỏ bên ngoài để nhóm các dự án lại, không có thành viên trực tiếp.",
        "Khi mời vào Dự án: Người đó sẽ thấy dự án hiện lên ở Dashboard của họ."
    ],
    errors: [
        "• Lỗi 'Không tìm thấy tài nguyên': Có thể dự án đã bị xóa bởi Admin khác.",
        "• Lỗi 'Không có quyền truy cập': Bạn đang cố gắng chỉnh sửa dự án mà bạn chỉ có quyền 'Xem' (Viewer).",
        "• Quy tắc bắt buộc: Tên Workspace không được để trống."
    ]
};

export const boardGuide = {
    kanban: [
        "• Tạo việc: Bấm nút '+ Thêm thẻ mới' ở cột 'Chưa làm' hoặc 'Đang làm'.",
        "• Di chuyển: Kéo thả thẻ từ cột này sang cột khác.",
        "• WIP Limit (Giới hạn làm đồng thời): Nếu cột 'Đang làm' hiện màu đỏ, nghĩa là nhóm đang ôm đồm quá nhiều việc. Hãy hoàn thành bớt trước khi kéo thêm vào."
    ],
    members: [
        "• ADMIN: Toàn quyền (Sửa tên bảng, xóa bảng, mời/xóa thành viên).",
        "• MEMBER: Được tạo/sửa/kéo thả thẻ công việc. Được mời thêm người khác.",
        "• VIEWER: Chỉ được xem, không được chỉnh sửa bất cứ thứ gì."
    ],
    history: [
        "Ghi lại mọi hoạt động: Ai đã làm gì, vào lúc nào.",
        "Dùng để tra cứu khi có tranh chấp hoặc muốn xem lại tiến trình."
    ]
};

export const forecastGuide = {
    params: [
        "• Velocity (Tốc độ): Nhóm làm được bao nhiêu 'điểm' (hoặc giờ) mỗi tuần. Càng cao càng tốt.",
        "• Cycle Time: Trung bình mất bao nhiêu ngày để xong 1 thẻ. Càng thấp càng tốt.",
        "• Estimated End Date (Dự kiến xong): Máy tính tự tính dựa trên tốc độ hiện tại.",
        "• Project Health (Sức khỏe): So sánh 'Ngày dự kiến xong' với 'Deadline' thực tế."
    ],
    calculations: [
        "1. Điểm công việc (Story Point): Hệ thống dùng số giờ 'Ước tính' (Estimate Hours) làm điểm độ khó.",
        "2. Tốc độ trung bình = (Tổng điểm đã làm trong quá khứ) / (Số tuần đã làm).",
        "3. Thời gian còn lại = (Tổng điểm chưa làm) / (Tốc độ trung bình)."
    ],
    charts: {
        burndown: [
            "- Đường chéo nét đứt: Là đường lý tưởng (Kế hoạch).",
            "- Vùng màu xanh: Là thực tế còn lại.",
            "- CÁCH ĐỌC: Nếu vùng màu xanh nằm TRÊN đường nét đứt -> Đang bị ch��m tiến độ.",
            "- Nếu vùng màu xanh nằm DƯỚI đường nét đứt -> Đang làm nhanh hơn kế hoạch."
        ],
        velocity: [
            "- Mỗi cột đại diện cho 1 tuần.",
            "- Cột càng cao: Tuần đó làm việc càng năng suất.",
            "- Nếu các cột trồi sụt thất thường: Nhóm làm việc không ổn định."
        ]
    }
};