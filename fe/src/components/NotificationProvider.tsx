import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, Button } from "@mui/material";

type Severity = "success" | "error" | "info" | "warning";
type NotifyOptions = { actionLabel?: string; onAction?: () => void; autoHideMs?: number };

type Ctx = {
    notify: (message: string, severity?: Severity, opts?: NotifyOptions) => void;
};

const NotificationContext = createContext<Ctx | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState("");
    const [severity, setSeverity] = useState<Severity>("info");
    const [actionLabel, setActionLabel] = useState<string | undefined>();
    const [onAction, setOnAction] = useState<(() => void) | undefined>();
    const [autoHideMs, setAutoHideMs] = useState<number | undefined>(3000);

    const notify = useCallback((message: string, sev: Severity = "info", opts?: NotifyOptions) => {
        setMsg(message);
        setSeverity(sev);
        setActionLabel(opts?.actionLabel);
        setOnAction(() => opts?.onAction);
        setAutoHideMs(opts?.autoHideMs ?? 3000);
        setOpen(true);
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={autoHideMs}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setOpen(false)}
                    severity={severity}
                    variant="filled"
                    action={
                        actionLabel && onAction ? (
                            <Button color="inherit" size="small" onClick={() => { onAction(); setOpen(false); }}>
                                {actionLabel}
                            </Button>
                        ) : null
                    }
                    sx={{ alignItems: "center" }}
                >
                    {msg}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
    return ctx;
};