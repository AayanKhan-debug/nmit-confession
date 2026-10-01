package com.nmit.confessions.service;

import com.nmit.confessions.enums.ScreeningFlag;
import java.util.Set;

public interface ContentScreeningService {
    Set<ScreeningFlag> screenContent(String content);
}
