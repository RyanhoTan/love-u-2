export interface paths {
    "/user/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 注册 */
        post: operations["register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 登录 */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/userinfo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取用户资料 */
        get: operations["getUserInfo"];
        /** 更新用户资料 */
        put: operations["updateUserInfo"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/couple-space": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取情侣空间 */
        get: operations["getCoupleSpace"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** 更新恋爱纪念日 */
        patch: operations["updateCoupleSpace"];
        trace?: never;
    };
    "/couple-space/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 创建邀请码
         * @description 已有有效邀请且未 regenerate 时复用现有邀请码；regenerate=true 时作废旧码并新建。
         */
        post: operations["createCoupleInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/couple-space/bind": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 绑定邀请码 */
        post: operations["bindCoupleSpace"];
        /** 解除绑定 */
        delete: operations["unbindCoupleSpace"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/anniversaries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取纪念日列表
         * @description 按 remainingDays、nextOccurrenceDate 排序；未绑定关系时返回空数组（仍为 200）。
         */
        get: operations["getAnniversaries"];
        put?: never;
        /** 创建纪念日 */
        post: operations["createAnniversary"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/anniversaries/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * 删除纪念日
         * @description 软删除（status=deleted）。
         */
        delete: operations["deleteAnniversary"];
        options?: never;
        head?: never;
        /**
         * 更新纪念日
         * @description 请求体为全量 AnniversaryPayload，非 partial。
         */
        patch: operations["updateAnniversary"];
        trace?: never;
    };
    "/wishes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取心愿列表 */
        get: operations["getWishes"];
        put?: never;
        /** 创建心愿 */
        post: operations["createWish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wishes/recycle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取回收站心愿 */
        get: operations["getDeletedWishes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wishes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取心愿详情 */
        get: operations["getWishById"];
        put?: never;
        post?: never;
        /**
         * 删除心愿
         * @description 软删除，响应返回删除后的 wish 实体。
         */
        delete: operations["deleteWish"];
        options?: never;
        head?: never;
        /**
         * 更新心愿状态
         * @description 当前仅允许修改 `status` 字段。
         */
        patch: operations["updateWish"];
        trace?: never;
    };
    "/wishes/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 恢复心愿 */
        post: operations["restoreWish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wishes/{id}/permanent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 永久删除心愿 */
        delete: operations["permanentlyDeleteWish"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wishes/{id}/records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取心愿记录 */
        get: operations["getWishRecords"];
        put?: never;
        /** 创建心愿记录 */
        post: operations["createWishRecord"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/album/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 获取相册媒体
         * @description 含 legacy wish_records.media_urls 合成项（id 可能为负数）；无分页。
         */
        get: operations["getAlbumMedia"];
        put?: never;
        /** 创建相册媒体 */
        post: operations["createAlbumMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/album/stories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取故事列表 */
        get: operations["getAlbumStories"];
        put?: never;
        /**
         * 创建故事
         * @description media 可选；有媒体时会写入 album_media 并设置封面。
         */
        post: operations["createAlbumStory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/album/stories/favorites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取收藏故事 */
        get: operations["getFavoriteAlbumStories"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/album/stories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取故事详情 */
        get: operations["getAlbumStory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/album/stories/{id}/favorite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 设置故事收藏 */
        post: operations["updateAlbumStoryFavorite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/upload/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 上传媒体文件
         * @description 请求体为原始二进制；成功响应为 `{ key, url }`，无 message。
         */
        post: operations["uploadMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/partner-chat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 伴侣聊天 WebSocket
         * @description Not a JSON REST endpoint. Clients open a WebSocket to
         *     `ws(s)://<host>/partner-chat?token=<jwt>` (or Bearer on upgrade).
         *
         *     Requires an active bound couple relationship; otherwise upgrade is rejected
         *     with HTTP 403.
         *
         *     Client → server message schemas:
         *     - PartnerChatClientMessageText
         *     - PartnerChatClientMessageAudio
         *     - PartnerChatClientRead
         *
         *     Server → client message schemas:
         *     - PartnerChatServerReady
         *     - PartnerChatServerMessage
         *     - PartnerChatServerDelivery
         *     - PartnerChatServerReadReceipt
         *     - PartnerChatServerError
         *
         *     Message `id` values are **strings** (unlike HTTP resource ids).
         */
        get: operations["partnerChatUpgrade"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * @description Uniform HTTP error body used by `HttpError`, JSON parse failures,
         *     unknown routes, and unhandled 500s.
         */
        ErrorMessage: {
            /** @description Human-readable error message (no stable machine code yet) */
            message: string;
        };
        /**
         * @description Calendar date `YYYY-MM-DD` (no time zone)
         * @example 2024-06-01
         */
        DateOnly: string;
        /** @description Calendar date or null when unset */
        DateOnlyNullable: string | null;
        /**
         * Format: date-time
         * @description ISO 8601 timestamp from `Date#toISOString()`
         */
        IsoDateTime: string;
        /**
         * Format: date-time
         * @description ISO 8601 timestamp or null
         */
        IsoDateTimeNullable: string | null;
        MessageOnlyResponse: {
            message: string;
        };
        AuthCredentials: {
            username: string;
            password: string;
        };
        /** @description Slim user returned by login only. Full profile is `User` from `/userinfo`. */
        LoginUser: {
            id: number;
            username: string;
        };
        LoginResponse: {
            message: string;
            token: string;
            user: components["schemas"]["LoginUser"];
        };
        RegisterResponse: {
            /** @example register success */
            message: string;
        };
        /** @description Partner card used inside CoupleSummary and CoupleSpace */
        PartnerSummary: {
            id: number;
            username: string;
            nickname: string | null;
            /** @description Avatar URL or null (field name is `avatar`, not avatarUrl) */
            avatar: string | null;
        };
        /**
         * @description Embedded couple **summary** on `User` from `/userinfo`.
         *     This is NOT the same model as `CoupleSpace` from `/couple-space`.
         *     Overlapping semantics (isBound, daysInLove, partner, anniversary date)
         *     exist in both, but CoupleSpace also exposes relationship + activeInvite.
         */
        CoupleSummary: {
            isBound: boolean;
            /** @description Days since anniversaryDate; null if unbound or no date */
            daysInLove: number | null;
            anniversaryDate: components["schemas"]["DateOnlyNullable"];
            partner: components["schemas"]["PartnerSummary"] | null;
        };
        /**
         * @description Canonical user entity from `/userinfo` serializeUser.
         *
         *     Client gaps (types only; runtime JSON still includes these fields):
         *     - Web AuthUser/UserProfile: often omits birthday, gender, coupleStatus, createdAt, updatedAt
         *     - App AuthUser: often omits nested `couple` while keeping coupleStatus
         */
        User: {
            id: number;
            username: string;
            nickname: string | null;
            avatar: string | null;
            signature: string | null;
            birthday: components["schemas"]["DateOnlyNullable"];
            /** @description Returned by GET/PUT userinfo; not updatable via current PUT body */
            gender: string | null;
            /**
             * @description Latest couple_relationships.status for this user, or null.
             *     Overlaps conceptually with `couple.isBound` — do not collapse in contract.
             */
            coupleStatus: string | null;
            couple: components["schemas"]["CoupleSummary"];
            createdAt: components["schemas"]["IsoDateTimeNullable"];
            updatedAt: components["schemas"]["IsoDateTimeNullable"];
        };
        UserInfoResponse: {
            message: string;
            user: components["schemas"]["User"];
        };
        UpdateUserProfileRequest: {
            /** @description Empty string is stored as null */
            nickname: string;
            /** @description Empty string is stored as null */
            avatar: string | null;
            /** @description Empty string is stored as null */
            signature: string;
            /** @description Required by current Zod schema; cannot be cleared to null via API */
            birthday: components["schemas"]["DateOnly"];
        };
        CoupleInvite: {
            code: string;
            /** @description e.g. pending, used (string as returned; not a closed enum in code) */
            status: string;
            expiresAt: components["schemas"]["IsoDateTimeNullable"];
            createdAt: components["schemas"]["IsoDateTimeNullable"];
            updatedAt: components["schemas"]["IsoDateTimeNullable"];
            usedAt: components["schemas"]["IsoDateTimeNullable"];
        };
        CoupleRelationship: {
            id: number;
            status: string;
            anniversaryDate: components["schemas"]["DateOnlyNullable"];
            createdAt: components["schemas"]["IsoDateTimeNullable"];
            updatedAt: components["schemas"]["IsoDateTimeNullable"];
            unboundAt: components["schemas"]["IsoDateTimeNullable"];
        };
        /**
         * @description Full couple-space payload from `/couple-space`.
         *     Distinct from `CoupleSummary` on User. Do not merge schemas.
         */
        CoupleSpace: {
            isBound: boolean;
            partner: components["schemas"]["PartnerSummary"] | null;
            relationship: components["schemas"]["CoupleRelationship"] | null;
            daysInLove: number | null;
            activeInvite: components["schemas"]["CoupleInvite"] | null;
        };
        CoupleSpaceResponse: {
            message: string;
            coupleSpace: components["schemas"]["CoupleSpace"];
        };
        /** @description Body may be empty or omitted; App currently sends no body. */
        CreateCoupleInviteRequest: {
            /**
             * @description If true, expires the current pending invite and creates a new code.
             *     Omitted or false reuses an existing valid pending invite when present.
             *     Not validated by Zod — only `=== true` is treated as regenerate.
             */
            regenerate?: boolean;
        };
        CoupleInviteResponse: {
            message: string;
            invite: components["schemas"]["CoupleInvite"] | null;
        };
        BindCoupleRequest: {
            inviteCode: string;
        };
        UpdateCoupleSpaceRequest: {
            anniversaryDate: components["schemas"]["DateOnlyNullable"];
        };
        /** @enum {string} */
        AnniversaryType: "love" | "birthday" | "holiday" | "custom";
        /** @enum {string} */
        AnniversaryRepeatType: "none" | "yearly";
        /** @enum {string} */
        AnniversaryStatus: "active" | "deleted";
        Anniversary: {
            id: number;
            relationshipId: number;
            createdByUserId: number | null;
            title: string;
            type: components["schemas"]["AnniversaryType"];
            originalDate: components["schemas"]["DateOnly"];
            repeatType: components["schemas"]["AnniversaryRepeatType"];
            reminderDaysBefore: number;
            status: components["schemas"]["AnniversaryStatus"];
            /** @description Computed server-side */
            nextOccurrenceDate: components["schemas"]["DateOnly"];
            /** @description Computed server-side */
            remainingDays: number;
            createdAt: components["schemas"]["IsoDateTimeNullable"];
            updatedAt: components["schemas"]["IsoDateTimeNullable"];
            deletedAt: components["schemas"]["IsoDateTimeNullable"];
        };
        /** @description Used for both create and update (full replacement, not partial) */
        AnniversaryPayload: {
            title: string;
            type: components["schemas"]["AnniversaryType"];
            originalDate: components["schemas"]["DateOnly"];
            repeatType: components["schemas"]["AnniversaryRepeatType"];
            reminderDaysBefore: number;
        };
        AnniversaryListResponse: {
            message: string;
            anniversaries: components["schemas"]["Anniversary"][];
        };
        AnniversaryItemResponse: {
            message: string;
            anniversary: components["schemas"]["Anniversary"];
        };
        /** @enum {string} */
        WishStatus: "todo" | "doing" | "done";
        Wish: {
            id: number;
            relationshipId: number | null;
            createdByUserId: number;
            title: string;
            /** @description DB null serialized as empty string */
            description: string;
            /** @description DB null serialized as empty string */
            cover: string;
            targetDate: components["schemas"]["DateOnly"];
            /** @description DB null serialized as empty string */
            locationName: string;
            latitude: number | null;
            longitude: number | null;
            /** @description Integer amount; unit not specified in code (open question) */
            budgetAmount: number | null;
            status: components["schemas"]["WishStatus"];
            /**
             * @description Backend `formatDateTime` may return null. App TypeScript currently
             *     marks this as non-null string — contract follows backend.
             */
            createdAt: components["schemas"]["IsoDateTimeNullable"];
            updatedAt: components["schemas"]["IsoDateTimeNullable"];
            deletedAt: components["schemas"]["IsoDateTimeNullable"];
            deleteExpiresAt: components["schemas"]["IsoDateTimeNullable"];
            isDeleted: boolean;
        };
        WishListResponse: {
            message: string;
            wishes: components["schemas"]["Wish"][];
        };
        WishItemResponse: {
            message: string;
            wish: components["schemas"]["Wish"];
        };
        CreateWishRequest: {
            title: string;
            /** @default  */
            description: string;
            /**
             * @description Valid URL or empty string; default ''
             * @default
             */
            cover: string;
            targetDate: components["schemas"]["DateOnly"];
            /** @default  */
            locationName: string;
            /** @default null */
            latitude: number | null;
            /** @default null */
            longitude: number | null;
            /** @default null */
            budgetAmount: number | null;
        };
        /** @description Current backend only allows status changes */
        UpdateWishRequest: {
            status: components["schemas"]["WishStatus"];
        };
        WishRecordMedia: {
            /** Format: uri */
            url: string;
            /** @enum {string} */
            mediaType: "image" | "video";
            /** @description Empty string when absent */
            thumbnailUrl: string;
        };
        WishRecord: {
            id: number;
            wishId: number;
            createdByUserId: number;
            content: string;
            recordDate: components["schemas"]["DateOnly"];
            mood: string;
            locationName: string;
            latitude: number | null;
            longitude: number | null;
            budgetAmount: number | null;
            media: components["schemas"]["WishRecordMedia"][];
            createdAt: components["schemas"]["IsoDateTimeNullable"];
            updatedAt: components["schemas"]["IsoDateTimeNullable"];
        };
        WishRecordsResponse: {
            message: string;
            wish: components["schemas"]["Wish"];
            records: components["schemas"]["WishRecord"][];
        };
        CreateWishRecordMediaInput: {
            /** Format: uri */
            url: string;
            /** @enum {string} */
            mediaType: "image" | "video";
            /** @default  */
            thumbnailUrl: string;
        };
        CreateWishRecordRequest: {
            /** @default  */
            content: string;
            recordDate: components["schemas"]["DateOnly"];
            /** @default  */
            mood: string;
            /** @default  */
            locationName: string;
            /** @default null */
            latitude: number | null;
            /** @default null */
            longitude: number | null;
            /** @default null */
            budgetAmount: number | null;
            /** @default [] */
            media: components["schemas"]["CreateWishRecordMediaInput"][];
        };
        CreateWishRecordResponse: {
            message: string;
            wish: components["schemas"]["Wish"];
            record: components["schemas"]["WishRecord"];
        };
        /** @enum {string} */
        AlbumMediaType: "image" | "video";
        /** @enum {string} */
        AlbumMediaSourceType: "wish_record" | "story" | "upload";
        AlbumMedia: {
            /**
             * @description Positive for DB rows. Legacy wish_records.media_urls synthesis may
             *     produce negative ids — treat as opaque identifiers.
             */
            id: number;
            relationshipId: number | null;
            createdByUserId: number;
            mediaType: components["schemas"]["AlbumMediaType"];
            sourceType: components["schemas"]["AlbumMediaSourceType"];
            sourceId: number | null;
            url: string;
            /** @description Empty string when absent */
            thumbnailUrl: string;
            /**
             * @description Date-only when set; empty string when unset
             *     (backend formatDateOnly returns "" for null — not JSON null)
             */
            takenAt: string;
            locationName: string;
            latitude: number | null;
            longitude: number | null;
            /** @description Same underlying created_at as createdAt */
            uploadedAt: components["schemas"]["IsoDateTime"];
            createdAt: components["schemas"]["IsoDateTime"];
        };
        AlbumMediaListResponse: {
            message: string;
            media: components["schemas"]["AlbumMedia"][];
        };
        AlbumMediaItemResponse: {
            message: string;
            media: components["schemas"]["AlbumMedia"];
        };
        CreateAlbumMediaRequest: {
            mediaType: components["schemas"]["AlbumMediaType"];
            url: string;
            /** @default  */
            thumbnailUrl: string;
            takenAt?: components["schemas"]["DateOnly"];
            /** @default  */
            locationName: string;
            /** @default null */
            latitude: number | null;
            /** @default null */
            longitude: number | null;
        };
        AlbumStory: {
            id: number;
            relationshipId: number | null;
            createdByUserId: number;
            title: string;
            description: string;
            coverMediaId: number | null;
            coverUrl: string;
            coverThumbnailUrl: string;
            /** @description Count of image media (API name photos, not photoCount) */
            photos: number;
            videos: number;
            isFavorite: boolean;
            createdAt: components["schemas"]["IsoDateTime"];
            updatedAt: components["schemas"]["IsoDateTime"];
        };
        AlbumStoryListResponse: {
            message: string;
            stories: components["schemas"]["AlbumStory"][];
        };
        AlbumStoryDetailResponse: {
            message: string;
            story: components["schemas"]["AlbumStory"];
            media: components["schemas"]["AlbumMedia"][];
        };
        AlbumStoryItemResponse: {
            message: string;
            story: components["schemas"]["AlbumStory"];
        };
        CreateAlbumStoryMediaInput: {
            mediaType: components["schemas"]["AlbumMediaType"];
            url: string;
            /** @default  */
            thumbnailUrl: string;
            takenAt?: components["schemas"]["DateOnly"];
            /** @default  */
            locationName: string;
            /** @default null */
            latitude: number | null;
            /** @default null */
            longitude: number | null;
        };
        CreateAlbumStoryRequest: {
            title: string;
            /** @default  */
            description: string;
            /** @default [] */
            media: components["schemas"]["CreateAlbumStoryMediaInput"][];
        };
        UpdateAlbumStoryFavoriteRequest: {
            isFavorite: boolean;
        };
        /** @description Success body has NO `message` field — keep as implemented. */
        UploadMediaResponse: {
            /** @description Object storage key */
            key: string;
            /** @description Public URL */
            url: string;
        };
        PartnerChatClientMessageText: {
            /** @enum {string} */
            type: "message";
            /** @enum {string} */
            messageType: "text";
            text: string;
            clientMessageId?: string;
        };
        PartnerChatClientMessageAudio: {
            /** @enum {string} */
            type: "message";
            /** @enum {string} */
            messageType: "audio";
            audioUrl: string;
            audioDurationSeconds?: number;
            clientMessageId?: string;
        };
        PartnerChatClientRead: {
            /** @enum {string} */
            type: "read";
        };
        PartnerChatServerReady: {
            /** @enum {string} */
            type: "ready";
            userId: number;
            partnerId: number;
            relationshipId: number;
        };
        PartnerChatServerMessage: {
            /** @enum {string} */
            type: "message";
            /** @description Message id as string (not number) */
            id: string;
            fromUserId: number;
            relationshipId: number;
            text: string;
            /** @enum {string} */
            messageType: "text" | "audio";
            audioUrl?: string;
            audioDurationSeconds?: number;
            clientMessageId?: string;
            sentAt: components["schemas"]["IsoDateTime"];
        };
        PartnerChatServerDelivery: {
            /** @enum {string} */
            type: "delivery";
            /** @enum {string} */
            status: "sent" | "partner_offline";
            clientMessageId?: string;
            serverMessageId?: string;
            sentAt?: components["schemas"]["IsoDateTime"];
        };
        PartnerChatServerReadReceipt: {
            /** @enum {string} */
            type: "read_receipt";
            relationshipId: number;
            messageIds: string[];
            readAt: components["schemas"]["IsoDateTime"];
        };
        /** @description WS errors include `code`; HTTP errors currently do not */
        PartnerChatServerError: {
            /** @enum {string} */
            type: "error";
            code: string;
            message: string;
        };
    };
    responses: never;
    parameters: {
        /** @description Positive integer resource id */
        ResourceId: number;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type SchemaErrorMessage = components['schemas']['ErrorMessage'];
export type SchemaDateOnly = components['schemas']['DateOnly'];
export type SchemaDateOnlyNullable = components['schemas']['DateOnlyNullable'];
export type SchemaIsoDateTime = components['schemas']['IsoDateTime'];
export type SchemaIsoDateTimeNullable = components['schemas']['IsoDateTimeNullable'];
export type SchemaMessageOnlyResponse = components['schemas']['MessageOnlyResponse'];
export type SchemaAuthCredentials = components['schemas']['AuthCredentials'];
export type SchemaLoginUser = components['schemas']['LoginUser'];
export type SchemaLoginResponse = components['schemas']['LoginResponse'];
export type SchemaRegisterResponse = components['schemas']['RegisterResponse'];
export type SchemaPartnerSummary = components['schemas']['PartnerSummary'];
export type SchemaCoupleSummary = components['schemas']['CoupleSummary'];
export type SchemaUser = components['schemas']['User'];
export type SchemaUserInfoResponse = components['schemas']['UserInfoResponse'];
export type SchemaUpdateUserProfileRequest = components['schemas']['UpdateUserProfileRequest'];
export type SchemaCoupleInvite = components['schemas']['CoupleInvite'];
export type SchemaCoupleRelationship = components['schemas']['CoupleRelationship'];
export type SchemaCoupleSpace = components['schemas']['CoupleSpace'];
export type SchemaCoupleSpaceResponse = components['schemas']['CoupleSpaceResponse'];
export type SchemaCreateCoupleInviteRequest = components['schemas']['CreateCoupleInviteRequest'];
export type SchemaCoupleInviteResponse = components['schemas']['CoupleInviteResponse'];
export type SchemaBindCoupleRequest = components['schemas']['BindCoupleRequest'];
export type SchemaUpdateCoupleSpaceRequest = components['schemas']['UpdateCoupleSpaceRequest'];
export type SchemaAnniversaryType = components['schemas']['AnniversaryType'];
export type SchemaAnniversaryRepeatType = components['schemas']['AnniversaryRepeatType'];
export type SchemaAnniversaryStatus = components['schemas']['AnniversaryStatus'];
export type SchemaAnniversary = components['schemas']['Anniversary'];
export type SchemaAnniversaryPayload = components['schemas']['AnniversaryPayload'];
export type SchemaAnniversaryListResponse = components['schemas']['AnniversaryListResponse'];
export type SchemaAnniversaryItemResponse = components['schemas']['AnniversaryItemResponse'];
export type SchemaWishStatus = components['schemas']['WishStatus'];
export type SchemaWish = components['schemas']['Wish'];
export type SchemaWishListResponse = components['schemas']['WishListResponse'];
export type SchemaWishItemResponse = components['schemas']['WishItemResponse'];
export type SchemaCreateWishRequest = components['schemas']['CreateWishRequest'];
export type SchemaUpdateWishRequest = components['schemas']['UpdateWishRequest'];
export type SchemaWishRecordMedia = components['schemas']['WishRecordMedia'];
export type SchemaWishRecord = components['schemas']['WishRecord'];
export type SchemaWishRecordsResponse = components['schemas']['WishRecordsResponse'];
export type SchemaCreateWishRecordMediaInput = components['schemas']['CreateWishRecordMediaInput'];
export type SchemaCreateWishRecordRequest = components['schemas']['CreateWishRecordRequest'];
export type SchemaCreateWishRecordResponse = components['schemas']['CreateWishRecordResponse'];
export type SchemaAlbumMediaType = components['schemas']['AlbumMediaType'];
export type SchemaAlbumMediaSourceType = components['schemas']['AlbumMediaSourceType'];
export type SchemaAlbumMedia = components['schemas']['AlbumMedia'];
export type SchemaAlbumMediaListResponse = components['schemas']['AlbumMediaListResponse'];
export type SchemaAlbumMediaItemResponse = components['schemas']['AlbumMediaItemResponse'];
export type SchemaCreateAlbumMediaRequest = components['schemas']['CreateAlbumMediaRequest'];
export type SchemaAlbumStory = components['schemas']['AlbumStory'];
export type SchemaAlbumStoryListResponse = components['schemas']['AlbumStoryListResponse'];
export type SchemaAlbumStoryDetailResponse = components['schemas']['AlbumStoryDetailResponse'];
export type SchemaAlbumStoryItemResponse = components['schemas']['AlbumStoryItemResponse'];
export type SchemaCreateAlbumStoryMediaInput = components['schemas']['CreateAlbumStoryMediaInput'];
export type SchemaCreateAlbumStoryRequest = components['schemas']['CreateAlbumStoryRequest'];
export type SchemaUpdateAlbumStoryFavoriteRequest = components['schemas']['UpdateAlbumStoryFavoriteRequest'];
export type SchemaUploadMediaResponse = components['schemas']['UploadMediaResponse'];
export type SchemaPartnerChatClientMessageText = components['schemas']['PartnerChatClientMessageText'];
export type SchemaPartnerChatClientMessageAudio = components['schemas']['PartnerChatClientMessageAudio'];
export type SchemaPartnerChatClientRead = components['schemas']['PartnerChatClientRead'];
export type SchemaPartnerChatServerReady = components['schemas']['PartnerChatServerReady'];
export type SchemaPartnerChatServerMessage = components['schemas']['PartnerChatServerMessage'];
export type SchemaPartnerChatServerDelivery = components['schemas']['PartnerChatServerDelivery'];
export type SchemaPartnerChatServerReadReceipt = components['schemas']['PartnerChatServerReadReceipt'];
export type SchemaPartnerChatServerError = components['schemas']['PartnerChatServerError'];
export type ParameterResourceId = components['parameters']['ResourceId'];
export type $defs = Record<string, never>;
export interface operations {
    register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuthCredentials"];
            };
        };
        responses: {
            /** @description Registered */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegisterResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Username already exists */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuthCredentials"];
            };
        };
        responses: {
            /** @description Login success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Invalid credentials */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getUserInfo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserInfoResponse"];
                };
            };
            /** @description Invalid or expired token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    updateUserInfo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserProfileRequest"];
            };
        };
        responses: {
            /** @description Updated profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserInfoResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Invalid or expired token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Profile columns unsupported */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getCoupleSpace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Couple space */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoupleSpaceResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Missing tables */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    updateCoupleSpace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCoupleSpaceRequest"];
            };
        };
        responses: {
            /** @description Updated */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoupleSpaceResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Bound relationship not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    createCoupleInvite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["CreateCoupleInviteRequest"];
            };
        };
        responses: {
            /** @description Existing pending invite returned */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoupleInviteResponse"];
                };
            };
            /** @description New invite created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoupleInviteResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Already bound */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    bindCoupleSpace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BindCoupleRequest"];
            };
        };
        responses: {
            /** @description Bound */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoupleSpaceResponse"];
                };
            };
            /** @description Validation or own invite code */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Invite not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Already bound */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Invite expired */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    unbindCoupleSpace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Unbound */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageOnlyResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Bound relationship not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getAnniversaries: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /**
             * @description List sorted by remainingDays then nextOccurrenceDate.
             *     Empty array when user is not bound (still 200).
             */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnniversaryListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    createAnniversary: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnniversaryPayload"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnniversaryItemResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Bound couple relationship not found */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    deleteAnniversary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deleted */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageOnlyResponse"];
                };
            };
            /** @description Invalid id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Anniversary not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    updateAnniversary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnniversaryPayload"];
            };
        };
        responses: {
            /** @description Updated */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnniversaryItemResponse"];
                };
            };
            /** @description Invalid id or payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Anniversary not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getWishes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Wishes (no pagination) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    createWish: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateWishRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishItemResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getDeletedWishes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deleted wishes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getWishById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Wish */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishItemResponse"];
                };
            };
            /** @description Invalid id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    deleteWish: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Soft-deleted wish entity returned */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishItemResponse"];
                };
            };
            /** @description Invalid id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    updateWish: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateWishRequest"];
            };
        };
        responses: {
            /** @description Updated */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishItemResponse"];
                };
            };
            /** @description Invalid id or payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    restoreWish: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Restored */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishItemResponse"];
                };
            };
            /** @description Invalid id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Deleted wish not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    permanentlyDeleteWish: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Permanently deleted */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageOnlyResponse"];
                };
            };
            /** @description Invalid id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Deleted wish not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getWishRecords: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Wish plus records */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WishRecordsResponse"];
                };
            };
            /** @description Invalid id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Wish not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    createWishRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateWishRecordRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateWishRecordResponse"];
                };
            };
            /** @description Validation or invalid id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Wish not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Missing tables / ffmpeg */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getAlbumMedia: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Media list (no pagination) */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumMediaListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    createAlbumMedia: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAlbumMediaRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumMediaItemResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getAlbumStories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stories */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumStoryListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Stories table missing */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    createAlbumStory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAlbumStoryRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumStoryItemResponse"];
                };
            };
            /** @description Validation error */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getFavoriteAlbumStories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Favorite stories */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumStoryListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    getAlbumStory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Story + media */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumStoryDetailResponse"];
                };
            };
            /** @description Invalid story id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Story not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    updateAlbumStoryFavorite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Positive integer resource id
                 * @example
                 */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAlbumStoryFavoriteRequest"];
            };
        };
        responses: {
            /** @description Updated story */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AlbumStoryItemResponse"];
                };
            };
            /** @description Invalid id or payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
            /** @description Story not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    uploadMedia: {
        parameters: {
            query: {
                /**
                 * @description Storage folder segment. Not Zod-validated; clients use values like `album`.
                 * @example
                 */
                folder: string;
            };
            header: {
                /**
                 * @description Original file name (used for extension)
                 * @example
                 */
                "x-file-name": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/octet-stream": string;
                "*/*": string;
            };
        };
        responses: {
            /** @description Uploaded — body is `{ key, url }` without message */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadMediaResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorMessage"];
                };
            };
        };
    };
    partnerChatUpgrade: {
        parameters: {
            query?: {
                /**
                 * @description JWT when not using Authorization header
                 * @example
                 */
                token?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Switching Protocols (WebSocket) */
            101: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized upgrade rejection (plain text, not ErrorMessage JSON) */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No bound partner (plain text) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
