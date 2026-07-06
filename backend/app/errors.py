class ApiError(Exception):
    def __init__(self, status_code: int, kind: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.kind = kind
        self.message = message
